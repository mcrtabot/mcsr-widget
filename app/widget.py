import json
import os
import re
import tempfile
import time
import typing as t
from datetime import datetime
from glob import glob
from logging import getLogger
from zoneinfo import ZoneInfo

from cipher import decrypt
from logger import setup_logger

WIDGET_INTERVAL = os.getenv("WIDGET_INTERVAL")
WORLD_NAME_PREFIX = os.getenv("WORLD_NAME_PREFIX")
TIMER_IGT_SECRET_KEY = "faRQOs2GK5j863eP"

JST = ZoneInfo("Asia/Tokyo")

setup_logger()
logger = getLogger(__name__)


class TimelineItem(t.TypedDict):
    name: str
    igt: int
    rta: int


class Record(t.TypedDict):
    id: str
    run_number: int
    mc_version: str
    speedrunigt_version: str
    category: str
    run_type: str
    is_completed: bool
    is_coop: bool
    is_hardcore: bool
    world_name: str
    date: int
    retimed_igt: int
    final_igt: int
    final_rta: int
    open_lan: t.Optional[t.Any]
    timelines: t.List[TimelineItem]


class State(t.TypedDict):
    start_time: int
    base_run_number: int
    ignore_record_ids: set[str]
    processed_record_ids: set[str]
    records: list[Record]
    running_record: t.Optional[Record]


class OutputData(t.TypedDict):
    base_run_number: int
    runs: int
    completes: int
    records: list[Record]
    running_record: t.Optional[Record]


class MCSRWidgetHandler:
    def __init__(self) -> None:
        self._records_dir = "/records"
        self._saves_dir = "/saves"
        tmpdir = tempfile.mkdtemp()
        self._state_file = os.sep.join([tmpdir, "state.json"])
        self._output_file = "/data/widget.json"
        self._interval = int(WIDGET_INTERVAL) if WIDGET_INTERVAL and WIDGET_INTERVAL.isdigit() else 5
        self._running_data_cache: dict[str, dict] = {}

    def run(self):
        logger.info("records_dir=%s", self._records_dir)
        logger.info("saves_dir=%s", self._saves_dir)
        logger.info("state_file=%s", self._state_file)
        logger.info("output_file=%s", self._output_file)
        logger.info("interval=%s", self._interval)

        self.prepare()
        while True:
            self.process()
            self.wait()

    def prepare(self):
        os.makedirs(os.path.dirname(self._state_file), exist_ok=True)
        os.makedirs(os.path.dirname(self._output_file), exist_ok=True)

    def process(self):
        state = self.load_state()

        runs = 0
        completes = 0

        files = glob(f"{self._records_dir}/**/*.json")
        for file in files:
            record_id = file.split("/")[-1].replace(".json", "")

            if record_id in state["ignore_record_ids"]:
                continue

            if record_id in state["processed_record_ids"]:
                continue

            try:
                # リスト取得から処理までの間にファイルが移動した場合を考慮
                with open(file) as f:
                    data = json.load(f)
            except FileNotFoundError:
                logger.info("ファイルが見つからない %s", file)
                continue
            except json.JSONDecodeError:
                logger.info("解析できないファイル %s", file)
                state["ignore_record_ids"].add(record_id)
                continue

            if data["date"] < state["start_time"]:
                # ウィジェット開始時間より前のレコードは無視リストに追加
                state["ignore_record_ids"].add(record_id)
                continue

            if (match := re.match(rf"{WORLD_NAME_PREFIX}(\d+)", data["world_name"])) is None:
                state["ignore_record_ids"].add(record_id)
                continue

            run_number = int(match.group(1))
            if state["base_run_number"] == 0:
                state["base_run_number"] = run_number
            else:
                state["base_run_number"] = min(state["base_run_number"], run_number)

            logger.info("new record detected, file=%s", file)

            record = Record(
                id=record_id,
                run_number=run_number,
                mc_version=data["mc_version"],
                speedrunigt_version=data["speedrunigt_version"],
                category=data["category"],
                run_type=data["run_type"],
                is_completed=data["is_completed"],
                is_coop=data["is_coop"],
                is_hardcore=data["is_hardcore"],
                world_name=data["world_name"],
                date=data["date"],
                retimed_igt=data["retimed_igt"],
                final_igt=data["final_igt"],
                final_rta=data["final_rta"],
                open_lan=data["open_lan"],
                timelines=data["timelines"],
            )

            state["processed_record_ids"].add(record_id)

            # ネザー行けたデータをカウント対象とする
            is_target_record = any([tl["name"] == "enter_nether" for tl in record["timelines"]])
            if not is_target_record:
                continue

            state["records"].append(record)

        # 走っているワールドのレコードが取得できなかった場合は、以前のデータから補完
        running_record = self.extract_running_record(state["start_time"]) or state["running_record"]
        state["running_record"] = running_record

        runs = len(state["processed_record_ids"])
        completes = len([record for record in state["records"] if record["is_completed"] is True])

        # recordsをソート
        records = sorted(state["records"], key=lambda record: record["date"], reverse=True)

        # アウトプットデータの生成
        output_data = OutputData(
            base_run_number=state["base_run_number"],
            runs=runs,
            completes=completes,
            records=records,
            running_record=state["running_record"],
        )
        self.save_output_data(output_data)

        # 状態を更新
        self.save_state(state)

    def extract_running_record(self, start_time: int) -> t.Optional[Record]:
        # 各セーブディレクトリ(各インスタンス)毎の最新のワールド情報を取得
        running_datas: list[dict] = []
        for dir in sorted(glob(f"{self._saves_dir}/*")):
            save_dirs = glob(f"{dir}/{WORLD_NAME_PREFIX}*")
            if len(save_dirs) == 0:
                continue

            world_dir = sorted(
                save_dirs,
                key=lambda filename: (len(filename), filename),
                reverse=True,
            )[0]

            # timer.igt または timer.igt.old からデータを取得する
            # まれに上記２ファイルが存在しなかったり、暗号化の解読でエラーになる場合があるので、
            # その場合は、それより前に正常に取得できた場合のデータをキャッシュしておき、それを利用する。
            # キャッシュは self._running_data_cache に保存する

            running_data = None

            timer_igt_data = None
            timer_igt_file = f"{world_dir}/speedrunigt/data/timer.igt"
            try:
                with open(timer_igt_file, "r") as f:
                    timer_igt_data = f.read()
            except Exception as e:
                logger.info("file not exists %s", timer_igt_file)
                logger.info("%s", e)

            # ファイルが存在しない場合oldファイルを参照する
            if timer_igt_data is None:
                timer_igt_file = f"{world_dir}/speedrunigt/data/timer.igt.old"
                try:
                    with open(timer_igt_file, "r") as f:
                        timer_igt_data = f.read()
                except Exception as e:
                    logger.info("file not exists %s", timer_igt_file)
                    logger.info("%s", e)

            if timer_igt_data is not None:
                try:
                    decrypted_data = decrypt(timer_igt_data, TIMER_IGT_SECRET_KEY.encode()).decode()
                    data = json.loads(re.sub(r'^[^,]*,"', '{"', decrypted_data))

                    # 開始時間より後のワールドのみ残す
                    record_data = json.loads(data["resultRecord"])
                    if "date" in record_data and record_data["date"] >= start_time:
                        running_data = data

                except Exception as e:
                    logger.info("extract data error: %s", timer_igt_file)
                    logger.info("%s", e)

            if running_data is None:
                running_data = self._running_data_cache.get(dir)

            if running_data is not None:
                # 対象インスタンスごと（savesディレクトリごと）にキャッシュを保存する
                self._running_data_cache[dir] = running_data
                running_datas.append(running_data)

        if len(running_datas) == 0:
            return None

        running_data = sorted(running_datas, key=lambda data: data.get("leastTickTime"), reverse=True)[0]

        record_data = json.loads(running_data["resultRecord"])

        run_number = 0
        if (match := re.match(rf"{WORLD_NAME_PREFIX}(\d+)", record_data["world_name"])) is not None:
            run_number = int(match.group(1))

        record = Record(
            id="",
            run_number=run_number,
            mc_version=record_data["mc_version"],
            speedrunigt_version=record_data["speedrunigt_version"],
            category=record_data["category"],
            run_type=record_data["run_type"],
            is_completed=record_data["is_completed"],
            is_coop=record_data["is_coop"],
            is_hardcore=record_data["is_hardcore"],
            world_name=record_data["world_name"],
            date=record_data["date"],
            retimed_igt=record_data["retimed_igt"],
            final_igt=record_data["final_igt"],
            final_rta=record_data["final_rta"],
            open_lan=record_data["open_lan"],
            timelines=record_data["timelines"],
        )

        return record

    def wait(self):
        """実行間隔だけ待機する"""
        for i in range(self._interval):
            print(".", end="", flush=True)
            time.sleep(1)
        print("\r" + " " * (self._interval) + "\r", end="", flush=True)

    def load_state(self) -> State:
        if not os.path.exists(self._state_file):
            return State(
                start_time=int(datetime.now().timestamp() * 1000),
                base_run_number=0,
                ignore_record_ids=set(),
                processed_record_ids=set(),
                records=[],
                running_record=None,
            )

        with open(self._state_file) as f:
            data = json.load(f)
            return State(
                start_time=data["start_time"],
                base_run_number=data["base_run_number"],
                ignore_record_ids=set(data["ignore_record_ids"]),
                processed_record_ids=set(data["processed_record_ids"]),
                records=data["records"],
                running_record=None,
            )

    def save_state(self, state: State) -> None:
        data = {
            "start_time": state["start_time"],
            "base_run_number": state["base_run_number"],
            "ignore_record_ids": sorted(state["ignore_record_ids"]),
            "processed_record_ids": sorted(state["processed_record_ids"]),
            "records": state["records"],
            "running_record": state["running_record"],
        }
        with open(self._state_file, "w") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

    def save_output_data(self, output_data: OutputData) -> None:
        with open(self._output_file, "w") as f:
            json.dump(output_data, f, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    MCSRWidgetHandler().run()

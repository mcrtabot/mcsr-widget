import { Setting, TimelineSetting } from './types';

export const mergeTimelineSetting = (a: TimelineSetting, b: TimelineSetting) => {
  const aFont = a.font || {};
  const aItemLabelFont = { ...a.font, ...(a.itemLabelFont || {}) };
  const aItemDiffTimeFont = { ...a.font, ...(a.itemDiffTimeFont || {}) };

  const bFont = b.font || {};
  const bItemLabelFont = { ...b.font, ...(b.itemLabelFont || {}) };
  const bItemDiffTimeFont = { ...b.font, ...(b.itemDiffTimeFont || {}) };

  return {
    ...a,
    ...b,
    font: { ...aFont, ...bFont },
    itemLabelFont: { ...aItemLabelFont, ...bItemLabelFont },
    itemDiffTimeFont: { ...aItemDiffTimeFont, ...bItemDiffTimeFont },
  };
};

export const defaultSetting: Setting = {
  width: 192,

  backgroundColor: 'transparent',

  textColor: '#111111',

  font: {
    fontFamily: 'Minecraft, sans-serif',
    fontSize: '18px',
    fontWeight: 'normal',
    fontStyle: 'normal',
  },

  separatorColor: '#ffffff',

  components: [
    '[PersonalBest]',
    '[---] | ',
    '[Label] | World # | font-size: 18px;',
    '[WorldNumber] | font-size: 32px; text-align: center;',
    '[CurrentRun]',
    '[---] | ',
    '[Label] | Completed | font-size: 18px;',
    '[CompletedRunTimes]',
    '[---] | ',
    '[Label] | Recent | font-size: 18px;',
    '[RecentRuns]',
  ],

  timelineItemLabels: {
    enter_nether: 'ネザーイン',
    enter_bastion: '廃要塞',
    enter_fortress: 'ネザー要塞',
    nether_travel: 'ブラインド',
    enter_stronghold: 'エンド要塞',
    enter_end: 'エンドイン',
    complete: 'GG',
  },

  timeline: {
    font: {
      fontFamily: 'Minecraft, sans-serif',
      fontSize: '18px',
    },

    textColor: '#ffffff',
    highlightTextColor: '#ff6666',
    backgroundColor: 'rgba(0,0,0,0.98)',
    imcompletedBackgroundColor: '',
    displayTitle: true,
    title: '',
    iconPattern: 1,
    displayItemLabel: false,
    itemLabelFont: {
      fontFamily: 'sans-serif',
      fontSize: '0.7em',
      fontWeight: 'bold',
    },
    displayItemDiffTime: false,
    itemDiffTimePosition: 'right',
    itemDiffTimeFont: {
      fontSize: '0.7em',
    },
  },

  pbTimeline: {
    title: "PB's Timeline",
    displayItemLabel: true,
  } as TimelineSetting,

  currentRunTimeline: {
    backgroundColor: 'rgba(0,0,0,0.98)',
    displayTitle: true,
    title: 'LIVE',
    displayItemDiffTime: true,
  } as TimelineSetting,
  displayCurrentRunNextTimelineItem: true,
  currentRunNextTimelineItemStyle: 'hyphen',

  recentRunsTimeline: {
    imcompletedBackgroundColor: 'rgba(96,96,96,0.98)',
    title: '[WorldNumber]',
    displayItemDiffTime: true,
  } as TimelineSetting,
  displayRecentRunsIncompletedRuns: true,
  recentRunsItemCount: 10,
  recentRunsItemDisplayDuration: 0,

  completedRunTimes: {
    displayTitle: false,
  } as TimelineSetting,

  worldNumberType: 'relative',
};

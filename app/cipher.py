from Crypto.Cipher import AES
from base64 import b64decode, b64encode

IV = bytes([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

BLOCK_SIZE = 16


def pad(s):
    return s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(
        BLOCK_SIZE - len(s) % BLOCK_SIZE
    )


def unpad(s):
    return s[: -ord(s[len(s) - 1 :])]  # NOQA


def encrypt(plain_text, key):
    plain_text = pad(plain_text)
    cipher = AES.new(key, AES.MODE_CBC, IV)
    return b64encode(cipher.encrypt(plain_text))


def decrypt(cipher_text, key):
    cipher_text = b64decode(cipher_text)
    cipher = AES.new(key, AES.MODE_CBC, IV)
    return unpad(cipher.decrypt(cipher_text))

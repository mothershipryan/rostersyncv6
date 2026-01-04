
// This requires the CryptoJS library to be loaded, e.g., via CDN in index.html
declare const CryptoJS: any;

const MASTER_KEY_STORAGE_KEY = 'rostersync_master_key';

const getMasterKey = (): string => {
    let key = localStorage.getItem(MASTER_KEY_STORAGE_KEY);
    if (!key) {
        key = CryptoJS.lib.WordArray.random(32).toString();
        localStorage.setItem(MASTER_KEY_STORAGE_KEY, key);
    }
    return key;
};

export const encryptToken = (token: string): string => {
    const masterKey = getMasterKey();
    return CryptoJS.AES.encrypt(token, masterKey).toString();
};

export const decryptToken = (encryptedToken: string): string => {
    const masterKey = getMasterKey();
    const bytes = CryptoJS.AES.decrypt(encryptedToken, masterKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

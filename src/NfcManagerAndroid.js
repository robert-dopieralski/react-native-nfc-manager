import {callNative} from './NativeNfcManager';
import {NfcManagerBase} from './NfcManager';
import {MifareClassicHandlerAndroid} from './NfcTech/MifareClassicHandlerAndroid';
import {MifareUltralightHandlerAndroid} from './NfcTech/MifareUltralightHandlerAndroid';
import {handleNativeException, buildNfcExceptionAndroid} from './NfcError';

const NfcAdapter = {
  FLAG_READER_NFC_A: 0x1,
  FLAG_READER_NFC_B: 0x2,
  FLAG_READER_NFC_F: 0x4,
  FLAG_READER_NFC_V: 0x8,
  FLAG_READER_NFC_BARCODE: 0x10,
  FLAG_READER_SKIP_NDEF_CHECK: 0x80,
  FLAG_READER_NO_PLATFORM_SOUNDS: 0x100,
};

class NfcManagerAndroid extends NfcManagerBase {
  constructor() {
    super();
    this.cleanUpTagRegistration = false;
  }

  requestTechnology = async (tech, options = {}) => {
    try {
      if (typeof tech === 'string') {
        tech = [tech];
      }

      const sessionAvailable = await this._hasTagEventRegistrationAndroid();

      // make sure we do register for tag event
      if (!sessionAvailable) {
        await this.registerTagEvent(options);
        this.cleanUpTagRegistration = true;
      }

      return await callNative('requestTechnology', [tech]);
    } catch (ex) {
      throw buildNfcExceptionAndroid(ex);
    }
  };

  cancelTechnologyRequest = async (options = {}) => {
    const {throwOnError = false} = options;

    try {
      await callNative('cancelTechnologyRequest');

      if (!this.cleanUpTagRegistration) {
        await this.unregisterTagEvent();
        this.cleanUpTagRegistration = false;
      }
    } catch (ex) {
      if (throwOnError) {
        throw buildNfcExceptionAndroid(ex);
      }
    }
  };

  // -------------------------------------
  // public only for Android
  // -------------------------------------
  isEnabled = () => handleNativeException(callNative('isEnabled'));

  goToNfcSetting = () => handleNativeException(callNative('goToNfcSetting'));

  getLaunchTagEvent = () =>
    handleNativeException(callNative('getLaunchTagEvent'));

  setNdefPushMessage = (bytes) =>
    handleNativeException(callNative('setNdefPushMessage', [bytes]));

  setTimeout = (timeout) =>
    handleNativeException(callNative('setTimeout', [timeout]));

  connect = (techs) => handleNativeException(callNative('connect', [techs]));

  close = () => handleNativeException(callNative('close'));

  transceive = (bytes) =>
    handleNativeException(callNative('transceive', [bytes]));

  getMaxTransceiveLength = () =>
    handleNativeException(callNative('getMaxTransceiveLength'));

  // -------------------------------------
  // (android) NfcTech.MifareClassic API
  // -------------------------------------
  get mifareClassicHandlerAndroid() {
    if (!this._mifareClassicHandlerAndroid) {
      this._mifareClassicHandlerAndroid = new MifareClassicHandlerAndroid(this);
    }
    return this._mifareClassicHandlerAndroid;
  }

  // -------------------------------------
  // (android) NfcTech.MifareUltralight API
  // -------------------------------------
  get mifareUltralightHandlerAndroid() {
    if (!this._mifareUltralightHandlerAndroid) {
      this._mifareUltralightHandlerAndroid = new MifareUltralightHandlerAndroid(
        this,
      );
    }
    return this._mifareUltralightHandlerAndroid;
  }

  // -------------------------------------
  // Android private
  // -------------------------------------
  _hasTagEventRegistrationAndroid = () =>
    handleNativeException(callNative('hasTagEventRegistration'));
}

export {NfcAdapter, NfcManagerAndroid};

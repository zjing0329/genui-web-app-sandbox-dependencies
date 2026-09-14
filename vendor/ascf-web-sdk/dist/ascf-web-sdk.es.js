// 核心调用函数
function invokeApi(apiName, options) {
  if (!window || !window.atomicServiceProxy || !window.atomicServiceProxy.invokeJsApi) {
    console.error("window.atomicServiceProxy is undefined");
    return;
  }
  window.atomicServiceProxy.invokeJsApi(apiName, options);
}

// 账号服务相关
function getPhoneNumber(options) {
  invokeApi("getPhoneNumber", options);
}

function getAvatarInfo(options) {
  invokeApi("getAvatarInfo", options);
}

function getInvoiceTitle(options) {
  invokeApi("getInvoiceTitle", options);
}

function getDeliveryAddress(options) {
  invokeApi("getDeliveryAddress", options);
}

function getServiceSubscription(options) {
  invokeApi("getServiceSubscription", options);
}

// 导航相关
function navigateTo(options) {
  invokeApi("has.navigateTo", options);
}

function navigateToAtomicService(options) {
  invokeApi("has.navigateToAtomicService", options);
}

// ascfweb导航API
function ascfwebNavigateTo(options) {
  invokeApi("has.ascfweb.navigateTo", options);
}

function ascfwebNavigateBack(options) {
  invokeApi("has.ascfweb.navigateBack", options);
}

function ascfwebReLaunch(options) {
  invokeApi("has.ascfweb.reLaunch", options);
}

function ascfwebSwitchTab(options) {
  invokeApi("has.ascfweb.switchTab", options);
}

function ascfwebRedirectTo(options) {
  invokeApi("has.ascfweb.redirectTo", options);
}

function ascfwebPostMessage(options) {
  invokeApi("has.ascfweb.postMessage", options);
}

// router API
function routerPushUrl(options) {
  invokeApi("router.pushUrl", options);
}

function routerReplaceUrl(options) {
  invokeApi("router.replaceUrl", options);
}

function routerBack(options) {
  invokeApi("router.back", options);
}

function routerClear(options) {
  invokeApi("router.clear", options);
}

// navPathStack API
function navPathStackPushPath(options) {
  invokeApi("navPathStack.pushPath", options);
}

function navPathStackReplacePath(options) {
  invokeApi("navPathStack.replacePath", options);
}

function navPathStackPop(options) {
  invokeApi("navPathStack.pop", options);
}

function navPathStackClear(options) {
  invokeApi("navPathStack.clear", options);
}

// asWeb API
function asWebPostMessage(options) {
  invokeApi("asWeb.postMessage", options);
}

function asWebGetEnv(options) {
  invokeApi("asWeb.getEnv", options);
}

function asWebCheckJsApi(options) {
  invokeApi("asWeb.checkJsApi", options);
}

// 相机相关
function cameraPickerPick(options) {
  invokeApi("cameraPicker.pick", options);
}

// 图片选择相关
function photoViewPickerSelect(options) {
  invokeApi("photoViewPicker.select", options);
}

// 文件预览相关
function filePreviewOpenPreview(options) {
  invokeApi("filePreview.openPreview", options);
}

// 网络请求相关
function requestUploadFile(options) {
  invokeApi("request.uploadFile", options);
}

function requestDownloadFile(options) {
  invokeApi("request.downloadFile", options);
}

// 本地图片相关
function getLocalImgData(options) {
  invokeApi("getLocalImgData", options);
}

// 网络状态相关
function connectionGetNetworkType(options) {
  invokeApi("connection.getNetworkType", options);
}

// 位置服务相关
function locationGetLocation(options) {
  invokeApi("location.getLocation", options);
}

// has.getLocation - 获取位置
function hasGetLocation(options) {
  if (!window || !window.atomicServiceProxy || !window.atomicServiceProxy.invokeJsApi) {
    console.error("window.atomicServiceProxy is undefined");
    if (options && options.fail) {
      options.fail(new Error("window.atomicServiceProxy is undefined"));
    }
    return;
  }
  window.atomicServiceProxy.invokeJsApi("has.getLocation", options);
}

// has.openLocation - 打开地图定位
function hasOpenLocation(options) {
  if (!window || !window.atomicServiceProxy || !window.atomicServiceProxy.invokeJsApi) {
    console.error("window.atomicServiceProxy is undefined");
    if (options && options.fail) {
      options.fail(new Error("window.atomicServiceProxy is undefined"));
    }
    return;
  }
  window.atomicServiceProxy.invokeJsApi("has.openLocation", options);
}

// 设备运动API - has.startDeviceMotionListening
function startDeviceMotionListening(options) {
  invokeApi("has.startDeviceMotionListening", options);
}

// 设备运动API - has.stopDeviceMotionListening
function stopDeviceMotionListening(options) {
  invokeApi("has.stopDeviceMotionListening", options);
}

// 设备运动API - has.onDeviceMotionChange
function onDeviceMotionChange(options) {
  invokeApi("has.onDeviceMotionChange", options);
}

// 设备运动API - has.offDeviceMotionChange
function offDeviceMotionChange(options) {
  invokeApi("has.offDeviceMotionChange", options);
}

// 加速度计API - has.startAccelerometer
function startAccelerometer(options) {
  invokeApi("has.startAccelerometer", options);
}

// 加速度计API - has.stopAccelerometer
function stopAccelerometer(options) {
  invokeApi("has.stopAccelerometer", options);
}

// 加速度计API - has.onAccelerometerChange
function onAccelerometerChange(options) {
  invokeApi("has.onAccelerometerChange", options);
}

// 加速度计API - has.offAccelerometerChange
function offAccelerometerChange(options) {
  invokeApi("has.offAccelerometerChange", options);
}

// 指南针API - has.startCompass
function startCompass(options) {
  invokeApi("has.startCompass", options);
}

// 指南针API - has.stopCompass
function stopCompass(options) {
  invokeApi("has.stopCompass", options);
}

// 指南针API - has.onCompassChange
function onCompassChange(options) {
  invokeApi("has.onCompassChange", options);
}

// 指南针API - has.offCompassChange
function offCompassChange(options) {
  invokeApi("has.offCompassChange", options);
}

// 陀螺仪API - has.startGyroscope
function startGyroscope(options) {
  invokeApi("has.startGyroscope", options);
}

// 陀螺仪API - has.stopGyroscope
function stopGyroscope(options) {
  invokeApi("has.stopGyroscope", options);
}

// 陀螺仪API - has.onGyroscopeChange
function onGyroscopeChange(options) {
  invokeApi("has.onGyroscopeChange", options);
}

// 陀螺仪API - has.offGyroscopeChange
function offGyroscopeChange(options) {
  invokeApi("has.offGyroscopeChange", options);
}

// ECA API - has.pushEca
function pushEca(options) {
  invokeApi("has.pushEca", options);
}

// 登录相关
function login(options) {
  invokeApi("login", options);
}

// 支付相关
function requestPayment(options) {
  invokeApi("requestPayment", options);
}

function cashierPicker(options) {
  invokeApi("cashierPicker", options);
}

// 合同相关
function requestContract(options) {
  invokeApi("requestContract", options);
}

// 订阅消息相关
function requestSubscribeMessage(options) {
  invokeApi("requestSubscribeMessage", options);
}

// IAP相关
function createIap(options) {
  invokeApi("createIap", options);
}

function finishIap(options) {
  invokeApi("finishIap", options);
}

function queryIap(options) {
  invokeApi("queryIap", options);
}

function queryIapProducts(options) {
  invokeApi("queryIapProducts", options);
}

function queryIapEnvStatus(options) {
  invokeApi("queryIapEnvStatus", options);
}

function isIapSandboxActivated(options) {
  invokeApi("isIapSandboxActivated", options);
}

function showIapManagedSubscriptions(options) {
  invokeApi("showIapManagedSubscriptions", options);
}

// 实名认证相关
function startRealNameVerification(options) {
  invokeApi("startRealNameVerification", options);
}

function startRealNameAuth(options) {
  invokeApi("startRealNameAuth", options);
}

function startFaceVerification(options) {
  invokeApi("startFaceVerification", options);
}

// 系统信息相关 - 同步获取系统信息
function getSystemInfoSync(options) {
  invokeApi("has.getSystemInfoSync", options);
}

// 系统信息相关 - 异步获取系统信息
function getSystemInfo(options) {
  invokeApi("has.getSystemInfo", options);
}

// 窗口信息相关（支持回调和Promise方式）
function getWindowInfo(options) {
  if (!window || !window.atomicServiceProxy || !window.atomicServiceProxy.invokeJsApi) {
    console.error("window.atomicServiceProxy is undefined");
    if (options && options.callback) {
      options.callback(new Error("window.atomicServiceProxy is undefined"), null);
    }
    return;
  }
  if (!options || (!options.success && !options.fail && !options.complete && !options.callback)) {
    return new Promise((resolve, reject) => {
      window.atomicServiceProxy.invokeJsApi("has.getWindowInfo", {
        success: resolve,
        fail: reject,
        complete: resolve
      });
    });
  }
  window.atomicServiceProxy.invokeJsApi("has.getWindowInfo", options);
}

// 系统设置相关（支持回调和Promise方式）
function getSystemSetting(options) {
  if (!window || !window.atomicServiceProxy || !window.atomicServiceProxy.invokeJsApi) {
    console.error("window.atomicServiceProxy is undefined");
    if (options && options.callback) {
      options.callback(new Error("window.atomicServiceProxy is undefined"), null);
    }
    return;
  }
  if (!options || (!options.success && !options.fail && !options.complete && !options.callback)) {
    return new Promise((resolve, reject) => {
      window.atomicServiceProxy.invokeJsApi("has.getSystemSetting", {
        success: resolve,
        fail: reject,
        complete: resolve
      });
    });
  }
  window.atomicServiceProxy.invokeJsApi("has.getSystemSetting", options);
}

// 设备信息相关（支持回调和Promise方式）
function getDeviceInfo(options) {
  if (!window || !window.atomicServiceProxy || !window.atomicServiceProxy.invokeJsApi) {
    console.error("window.atomicServiceProxy is undefined");
    if (options && options.callback) {
      options.callback(new Error("window.atomicServiceProxy is undefined"), null);
    }
    return;
  }
  if (!options || (!options.success && !options.fail && !options.complete && !options.callback)) {
    return new Promise((resolve, reject) => {
      window.atomicServiceProxy.invokeJsApi("has.getDeviceInfo", {
        success: resolve,
        fail: reject,
        complete: resolve
      });
    });
  }
  window.atomicServiceProxy.invokeJsApi("has.getDeviceInfo", options);
}

// 图片API - checkJsApi
function checkJsApi(options) {
  invokeApi("has.checkJsApi", options);
}

// 图片API - chooseImage
function chooseImage(options) {
  invokeApi("has.chooseImage", options);
}

// 图片API - previewImage
function previewImage(options) {
  invokeApi("has.previewImage", options);
}

// 图片API - uploadImage
function uploadImage(options) {
  invokeApi("has.uploadImage", options);
}

// 图片API - downloadImage
function downloadImage(options) {
  invokeApi("has.downloadImage", options);
}

// 网络状态相关（支持success/fail回调方式）
function getNetworkType(options) {
  if (!window || !window.atomicServiceProxy || !window.atomicServiceProxy.invokeJsApi) {
    console.error("window.atomicServiceProxy is undefined");
    if (options && options.callback) {
      options.callback(new Error("window.atomicServiceProxy is undefined"), null);
    }
    if (options && options.fail) {
      options.fail(new Error("window.atomicServiceProxy is undefined"));
    }
    return;
  }
  window.atomicServiceProxy.invokeJsApi("has.getNetworkType", options);
}

const router = {
  pushUrl: routerPushUrl,
  replaceUrl: routerReplaceUrl,
  back: routerBack,
  clear: routerClear
};

const navPathStack = {
  pushPath: navPathStackPushPath,
  replacePath: navPathStackReplacePath,
  pop: navPathStackPop,
  clear: navPathStackClear
};

const asWeb = {
  postMessage: asWebPostMessage,
  getEnv: asWebGetEnv,
  checkJsApi: asWebCheckJsApi
};

const cameraPicker = {
  pick: cameraPickerPick
};

const photoViewPicker = {
  select: photoViewPickerSelect
};

const filePreview = {
  openPreview: filePreviewOpenPreview
};

const request = {
  uploadFile: requestUploadFile,
  downloadFile: requestDownloadFile
};

const connection = {
  getNetworkType: connectionGetNetworkType
};

const location = {
  getLocation: locationGetLocation
};

const ascfweb = {
  navigateTo: ascfwebNavigateTo,
  navigateBack: ascfwebNavigateBack,
  reLaunch: ascfwebReLaunch,
  switchTab: ascfwebSwitchTab,
  redirectTo: ascfwebRedirectTo,
  postMessage: ascfwebPostMessage
};

export {
  router,
  navPathStack,
  asWeb,
  cameraPicker,
  photoViewPicker,
  filePreview,
  request,
  connection,
  location,
  ascfweb,
  login,
  requestPayment,
  cashierPicker,
  requestContract,
  requestSubscribeMessage,
  getLocalImgData,
  createIap,
  finishIap,
  queryIap,
  queryIapProducts,
  queryIapEnvStatus,
  isIapSandboxActivated,
  showIapManagedSubscriptions,
  startRealNameVerification,
  startRealNameAuth,
  startFaceVerification,
  getPhoneNumber,
  getAvatarInfo,
  getInvoiceTitle,
  getDeliveryAddress,
  getServiceSubscription,
  navigateTo,
  navigateToAtomicService,
  getSystemInfoSync,
  getSystemInfo,
  getWindowInfo,
  getSystemSetting,
  getDeviceInfo,
  checkJsApi,
  chooseImage,
  previewImage,
  uploadImage,
  downloadImage,
  getNetworkType,
  hasGetLocation as getLocation,
  hasOpenLocation as openLocation,
  startDeviceMotionListening,
  stopDeviceMotionListening,
  onDeviceMotionChange,
  offDeviceMotionChange,
  startAccelerometer,
  stopAccelerometer,
  onAccelerometerChange,
  offAccelerometerChange,
  startCompass,
  stopCompass,
  onCompassChange,
  offCompassChange,
  startGyroscope,
  stopGyroscope,
  onGyroscopeChange,
  offGyroscopeChange,
  pushEca
};

export default {
  router,
  navPathStack,
  asWeb,
  cameraPicker,
  photoViewPicker,
  filePreview,
  request,
  connection,
  location,
  ascfweb,
  login,
  requestPayment,
  cashierPicker,
  requestContract,
  requestSubscribeMessage,
  getLocalImgData,
  createIap,
  finishIap,
  queryIap,
  queryIapProducts,
  queryIapEnvStatus,
  isIapSandboxActivated,
  showIapManagedSubscriptions,
  startRealNameVerification,
  startRealNameAuth,
  startFaceVerification,
  getPhoneNumber,
  getAvatarInfo,
  getInvoiceTitle,
  getDeliveryAddress,
  getServiceSubscription,
  navigateTo,
  navigateToAtomicService,
  getSystemInfoSync,
  getSystemInfo,
  getWindowInfo,
  getSystemSetting,
  getDeviceInfo,
  checkJsApi,
  chooseImage,
  previewImage,
  uploadImage,
  downloadImage,
  getNetworkType,
  getLocation: hasGetLocation,
  openLocation: hasOpenLocation,
  startDeviceMotionListening,
  stopDeviceMotionListening,
  onDeviceMotionChange,
  offDeviceMotionChange,
  startAccelerometer,
  stopAccelerometer,
  onAccelerometerChange,
  offAccelerometerChange,
  startCompass,
  stopCompass,
  onCompassChange,
  offCompassChange,
  startGyroscope,
  stopGyroscope,
  onGyroscopeChange,
  offGyroscopeChange,
  pushEca
};

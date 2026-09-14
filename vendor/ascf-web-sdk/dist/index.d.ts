declare function navigateTo(options: NavigateToOptions): void;
declare function navigateBack(options: NavigateBackOptions): void;
declare function switchTab(options: NavigateUrlOptions): void;
declare function reLaunch(options: NavigateUrlOptions): void;
declare function redirectTo(options: NavigateUrlOptions): void;
declare function postMessage(options: PostMessageOptions): void;
declare function getEnv(success: EnvCallback): void;
declare function checkJsApi(options: CheckJSApiOptions): void;
declare function chooseImage(options: ChooseImageOptions): void;
declare function previewImage(options: PreviewImageOptions): void;
declare function uploadImage(options: UploadImageOptions): void;
declare function downloadImage(options: DownloadImageOptions): void;
declare function getNetworkType(options: CallbackOptions<GetNetworkTypeResult>): void;
declare function openLocation(options: OpenLocationOptions): void;
declare function getLocation(options: LocationOptions): void;
declare function login(options: LoginOptions): void;
declare function requestPayment(options: RequestPaymentOptions): void;
declare function isIapSandboxActivated(options: IsIapSandboxActivatedOptions): void;
declare function showIapManagedSubscriptions(options: ShowIapManagedSubscriptionsOptions): void;
declare function queryIapProducts(options: QueryIapProductsOptions): void;
declare function queryIapEnvStatus(options: QueryIapEnvStatusOptions): void;
declare function createIap(options: CreateIapOptions): void;
declare function finishIap(options: FinishIapOptions): void;
declare function queryIap(options: QueryIapOptions): void;
declare function requestContract(options: RequestContractOptions): void;
declare function requestSubscribeMessage(options: RequestSubscribeMessageOptions): void;
declare function cashierPicker(options: CashierPickerOptions): void;
declare function startRealNameVerification(options: StartRealNameVerificationOptions): void;
declare function startRealNameAuth(options: StartRealNameAuthOptions): void;
declare function startFaceVerification(options: StartFaceVerificationOptions): void;
declare function getAvatarInfo(options: GetAvatarInfoOptions): void;
declare function getServiceSubscription(options: GetServiceSubscriptionOptions): void;
declare function getDeliveryAddress(options: GetDeliveryAddressOptions): void;
declare function getPhoneNumber(options: GetPhoneNumberOptions): void;
declare function getInvoiceTitle(options: GetInvoiceTitleOptions): void;
declare const _default: {
    ascfweb: {
        navigateTo: typeof navigateTo;
        navigateBack: typeof navigateBack;
        switchTab: typeof switchTab;
        reLaunch: typeof reLaunch;
        redirectTo: typeof redirectTo;
        postMessage: typeof postMessage;
        getEnv: typeof getEnv;
    };
    checkJsApi: typeof checkJsApi;
    chooseImage: typeof chooseImage;
    previewImage: typeof previewImage;
    uploadImage: typeof uploadImage;
    downloadImage: typeof downloadImage;
    getNetworkType: typeof getNetworkType;
    openLocation: typeof openLocation;
    getLocation: typeof getLocation;
    login: typeof login;
    requestPayment: typeof requestPayment;
    requestContract: typeof requestContract;
    isIapSandboxActivated: typeof isIapSandboxActivated;
    showIapManagedSubscriptions: typeof showIapManagedSubscriptions;
    queryIapProducts: typeof queryIapProducts;
    queryIapEnvStatus: typeof queryIapEnvStatus;
    createIap: typeof createIap;
    finishIap: typeof finishIap;
    queryIap: typeof queryIap;
    requestSubscribeMessage: typeof requestSubscribeMessage;
    cashierPicker: typeof cashierPicker;
    startRealNameVerification: typeof startRealNameVerification;
    startRealNameAuth: typeof startRealNameAuth;
    startFaceVerification: typeof startFaceVerification;
    getInvoiceTitle: typeof getInvoiceTitle;
    getPhoneNumber: typeof getPhoneNumber;
    getDeliveryAddress: typeof getDeliveryAddress;
    getServiceSubscription: typeof getServiceSubscription;
    getAvatarInfo: typeof getAvatarInfo;
};
export default _default;
export type AsError = {
    code?: number;
    message?: string;
};
export type CallbackOptions<T = void> = {
    success?: (res?: T) => void;
    fail?: (e: AsError) => void;
    complete?: (res?: AsError | T) => void;
};
export type NavigateToOptions = CallbackOptions & {
    url: string;
    event?: string;
    routeType?: object;
    routeConfig?: object;
    routeOptions?: object;
};
export type NavigateBackOptions = CallbackOptions & {
    delta?: number;
};
export type NavigateUrlOptions = CallbackOptions & {
    url: string;
};
export type PostMessageOptions = CallbackOptions & {
    data: string | object | Array<string | object>;
};
export type EnvResult = {
    ascf: boolean;
    systemInfo?: {
        deviceType: string;
        brand: string;
        productModel: string;
        osFullName: string;
    };
};
export type EnvCallback = (res: EnvResult) => void;
export declare enum SizeEnum {
    ORIGINAL = "original",
    COMPRESSED = "compressed"
}
export declare enum SourceType {
    ORIGINAL = "original",
    COMPRESSED = "compressed"
}
export type CheckJSApiOptions = CallbackOptions<CheckJsApiResult> & {
    jsApiList: string[];
};
export type CheckJsApiResult = {
    checkResult?: Record<string, boolean>;
};
export type ChooseImageOptions = CallbackOptions<ChooseImageResult> & {
    count?: number;
    sizeType?: string[];
    sourceType?: string[];
};
export type ChooseImageResult = {
    tempFilePaths: string[];
    tempFiles: ChooseImageFileItem[];
};
export type ChooseImageFileItem = {
    path: string;
    size: number;
};
export type PreviewImageOptions = CallbackOptions & {
    current?: string;
    urls: string[];
    showmenu?: boolean;
};
export type UploadImageOptions = CallbackOptions<UploadFileResult> & {
    url: string;
    name: string;
    header?: object;
    filePath: string;
    formData?: object;
};
export type UploadFileResult = {
    taskStates?: UploadFileTaskState[];
};
export type UploadFileTaskState = {
    path?: string;
    responseCode?: number;
    message?: string;
};
export type DownloadImageOptions = CallbackOptions<DownloadFileResult> & {
    url: string;
    header?: object;
    filePath?: string;
};
export type DownloadFileResult = {
    uri?: string;
};
export type GetNetworkTypeResult = {
    networkType: string;
};
export type OpenLocationOptions = CallbackOptions & {
    latitude: number;
    longitude: number;
    name: string;
    address?: string;
};
export type GetLocationResult = {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
    speed: number;
    verticalAccuracy: number;
};
export type LocationOptions = CallbackOptions<GetLocationResult> & {
    type?: string;
    altitude?: boolean;
    isHighAccuracy?: boolean;
    highAccuracyExpireTime?: number;
};
export type LoginResult = {
    code?: string;
    idToken?: string;
    openID: string;
    unionID: string;
};
export type LoginOptions = CallbackOptions<LoginResult> & {};
export type RequestPaymentOptions = CallbackOptions<RequestPaymentResult> & {
    orderStr: string;
    payload?: string;
};
export type RequestPaymentResult = {
    selectedPaymentType?: string;
    clientToken?: string;
    nextStep?: string;
    extraInfo?: string;
    payload?: string;
};
export type CashierPickerOptions = CallbackOptions<CashierPickerResult> & {
    tradeSummary?: string;
    amount?: number;
    currency?: string;
    extraInfo?: string;
};
export type CashierPickerResult = {
    selectedPaymentType?: string;
    clientToken?: string;
};
export type IsIapSandboxActivatedOptions = CallbackOptions<boolean> & {};
export type UIWindowParameter = {
    windowScreenMode: number;
};
export type ShowIapManagedSubscriptionsOptions = CallbackOptions & {
    uiParameter: UIWindowParameter;
    groupId?: string;
};
export type QueryIapProductsOptions = CallbackOptions<IapProduct[]> & {
    productType: number;
    productIds: string[];
};
export type QueryIapEnvStatusOptions = CallbackOptions & {};
export type CreateIapOptions = CallbackOptions<CreateIapResult> & {
    productId: string;
    productType: number;
    developerPayload?: string;
    reservedInfo?: string;
    promotionalOfferId?: string;
    applicationUserName?: string;
    jwsRepresentation?: string;
};
export type CreateIapResult = {
    purchaseData: string;
};
export type FinishIapOptions = CallbackOptions & {
    productType: number;
    purchaseToken: string;
    purchaseOrderId: string;
};
export type QueryIapOptions = CallbackOptions<QueryIapResult> & {
    productType: number;
    continuationToken?: string;
    queryType?: number;
};
export type QueryIapResult = {
    purchaseDataList: string[];
    continuationToken?: string;
};
export type IapProduct = {
    id: string;
    type: number;
    name: string;
    description: string;
    price: string;
    localPrice?: string;
    microPrice: number;
    originalLocalPrice: string;
    originalMicroPrice: number;
    currency: string;
    status?: number;
    subscriptionInfo?: SubscriptionInfo;
    promotionalOffers?: PromotionalOffer[];
    jsonRepresentation?: string;
};
export type SubscriptionInfo = {
    periodUnit: number;
    periodCount: number;
    groupId: string;
    groupLevel: number;
    hasEligibilityForIntroOffer?: boolean;
    introductoryOffer?: SubscriptionOffer;
};
export type SubscriptionOffer = {
    paymentMode: number;
    periodUnit: number;
    periodCount: number;
    localPrice: string;
    microPrice: number;
    offerType: number;
};
export type PromotionalOffer = {
    offerId: string;
    paymentMode: number;
    periodUnit?: number;
    periodCount?: number;
    localPrice: string;
    microPrice: number;
};
export type RequestContractOptions = CallbackOptions & {
    contractStr: string;
};
export type RequestSubscribeMessageResult = {
    errMsg: string;
    [TEMPLATE_ID: string]: string;
};
export type RequestSubscribeMessageOptions = CallbackOptions<RequestSubscribeMessageResult> & {
    tmplIds: string[];
};
export type StartRealNameVerificationOptions = CallbackOptions<string> & {
    preVerifyId: string;
};
export type StartRealNameAuthOptions = CallbackOptions<string> & {};
export type StartFaceVerificationOptions = CallbackOptions<string> & {
    preVerifyId: string;
};
export type GetInvoiceTitleResult = {
    type: string;
    title: string;
    taxNumber: string;
    companyAddress?: string;
    telephone?: string;
    bankName?: string;
    bankAccount?: string;
};
export type GetInvoiceTitleOptions = CallbackOptions<GetInvoiceTitleResult> & {};
export type GetPhoneNumberResult = {
    code?: string;
};
export type GetPhoneNumberOptions = CallbackOptions<GetPhoneNumberResult> & {};
export type GetDeliveryAddressResult = {
    userName: string;
    telNumber?: string;
    postalCode?: string;
    nationalCode?: string;
    provinceName?: string;
    cityName?: string;
    countyName?: string;
    streetName?: string;
    detailInfo: string;
};
export type GetDeliveryAddressOptions = CallbackOptions<GetDeliveryAddressResult> & {};
export type GetServiceSubscriptionResult = {
    errMsg: string;
    [TEMPLATE_ID: string]: string;
};
export type GetServiceSubscriptionOptions = CallbackOptions<GetServiceSubscriptionResult> & {
    tmplIds?: string[];
};
export type GetAvatarInfoResult = {
    avatarUri?: string;
};
export type GetAvatarInfoOptions = CallbackOptions<GetAvatarInfoResult> & {};

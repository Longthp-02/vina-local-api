export type RootStackParamList = {
  Home: undefined;
  Vendors: undefined;
  AddVendor: undefined;
  MyLists: undefined;
  PublicLists: undefined;
  TopLists: undefined;
  FollowingFeed: undefined;
  Notifications: undefined;
  CreateList: undefined;
  EditList: {
    listId: string;
  };
  ListDetail: {
    listId: string;
  };
  CreatorProfile: {
    userId: string;
  };
  Map: undefined;
  PhoneAuth: undefined;
  VerifyCode: {
    phoneNumber: string;
  };
  VendorDetail: {
    vendorId: string;
  };
};

export type HcmcWard = {
  name: string;
  latitude: number;
  longitude: number;
};

export type HcmcDistrict = {
  name: string;
  latitude: number;
  longitude: number;
  wards: HcmcWard[];
};

export const hcmcDistricts: HcmcDistrict[] = [
  {
    name: "District 1",
    latitude: 10.7769,
    longitude: 106.7009,
    wards: [
      { name: "Ben Nghe Ward", latitude: 10.7812, longitude: 106.7034 },
      { name: "Ben Thanh Ward", latitude: 10.7724, longitude: 106.6981 },
      { name: "Nguyen Thai Binh Ward", latitude: 10.7691, longitude: 106.6954 },
    ],
  },
  {
    name: "District 3",
    latitude: 10.7842,
    longitude: 106.6863,
    wards: [
      { name: "Ward 6", latitude: 10.7867, longitude: 106.6848 },
      { name: "Ward 7", latitude: 10.7819, longitude: 106.6902 },
      { name: "Vo Thi Sau Ward", latitude: 10.7901, longitude: 106.6908 },
    ],
  },
  {
    name: "District 4",
    latitude: 10.7594,
    longitude: 106.7046,
    wards: [
      { name: "Ward 1", latitude: 10.7618, longitude: 106.7052 },
      { name: "Ward 6", latitude: 10.7571, longitude: 106.7008 },
      { name: "Ward 13", latitude: 10.7544, longitude: 106.7101 },
    ],
  },
  {
    name: "District 5",
    latitude: 10.7557,
    longitude: 106.6664,
    wards: [
      { name: "Ward 1", latitude: 10.7592, longitude: 106.6701 },
      { name: "Ward 4", latitude: 10.7537, longitude: 106.6655 },
      { name: "Ward 11", latitude: 10.7488, longitude: 106.6619 },
    ],
  },
  {
    name: "District 7",
    latitude: 10.7342,
    longitude: 106.7218,
    wards: [
      { name: "Tan Phu Ward", latitude: 10.7298, longitude: 106.7247 },
      { name: "Tan Quy Ward", latitude: 10.7411, longitude: 106.7099 },
      { name: "Tan Phong Ward", latitude: 10.7291, longitude: 106.7056 },
    ],
  },
  {
    name: "District 10",
    latitude: 10.7717,
    longitude: 106.6676,
    wards: [
      { name: "Ward 2", latitude: 10.7729, longitude: 106.6718 },
      { name: "Ward 9", latitude: 10.7698, longitude: 106.6638 },
      { name: "Ward 14", latitude: 10.7646, longitude: 106.6689 },
    ],
  },
  {
    name: "District 11",
    latitude: 10.7641,
    longitude: 106.6478,
    wards: [
      { name: "Ward 5", latitude: 10.7618, longitude: 106.6511 },
      { name: "Ward 10", latitude: 10.7669, longitude: 106.6424 },
      { name: "Ward 14", latitude: 10.7582, longitude: 106.6457 },
    ],
  },
  {
    name: "District 12",
    latitude: 10.8678,
    longitude: 106.6419,
    wards: [
      { name: "Thanh Loc Ward", latitude: 10.8792, longitude: 106.6484 },
      { name: "Hiep Thanh Ward", latitude: 10.8674, longitude: 106.6548 },
      { name: "Tan Thoi Hiep Ward", latitude: 10.8509, longitude: 106.6299 },
    ],
  },
  {
    name: "Binh Thanh District",
    latitude: 10.8074,
    longitude: 106.7091,
    wards: [
      { name: "Ward 1", latitude: 10.8037, longitude: 106.7047 },
      { name: "Ward 14", latitude: 10.8094, longitude: 106.7129 },
      { name: "Ward 22", latitude: 10.7949, longitude: 106.7218 },
    ],
  },
  {
    name: "Thu Duc City",
    latitude: 10.8413,
    longitude: 106.8098,
    wards: [
      { name: "Thao Dien Ward", latitude: 10.8016, longitude: 106.7445 },
      { name: "An Khanh Ward", latitude: 10.7867, longitude: 106.7369 },
      { name: "Hiep Binh Chanh Ward", latitude: 10.8359, longitude: 106.7318 },
      { name: "Linh Trung Ward", latitude: 10.8718, longitude: 106.8022 },
      { name: "Long Thanh My Ward", latitude: 10.8429, longitude: 106.8421 },
    ],
  },
  {
    name: "Phu Nhuan District",
    latitude: 10.7992,
    longitude: 106.6797,
    wards: [
      { name: "Ward 2", latitude: 10.8011, longitude: 106.6791 },
      { name: "Ward 7", latitude: 10.7972, longitude: 106.6844 },
      { name: "Ward 10", latitude: 10.8033, longitude: 106.6732 },
    ],
  },
  {
    name: "Tan Binh District",
    latitude: 10.8014,
    longitude: 106.6527,
    wards: [
      { name: "Ward 2", latitude: 10.8017, longitude: 106.6481 },
      { name: "Ward 4", latitude: 10.8009, longitude: 106.6602 },
      { name: "Ward 12", latitude: 10.8077, longitude: 106.6478 },
    ],
  },
  {
    name: "Tan Phu District",
    latitude: 10.7916,
    longitude: 106.6277,
    wards: [
      { name: "Tay Thanh Ward", latitude: 10.8015, longitude: 106.6211 },
      { name: "Hoa Thanh Ward", latitude: 10.7839, longitude: 106.6377 },
      { name: "Phu Thanh Ward", latitude: 10.7892, longitude: 106.6318 },
    ],
  },
  {
    name: "Binh Tan District",
    latitude: 10.7656,
    longitude: 106.6004,
    wards: [
      { name: "Binh Tri Dong B Ward", latitude: 10.7729, longitude: 106.6067 },
      { name: "An Lac Ward", latitude: 10.7479, longitude: 106.6102 },
      { name: "Tan Tao Ward", latitude: 10.7441, longitude: 106.5869 },
    ],
  },
  {
    name: "Go Vap District",
    latitude: 10.8387,
    longitude: 106.6656,
    wards: [
      { name: "Ward 1", latitude: 10.8317, longitude: 106.6727 },
      { name: "Ward 5", latitude: 10.8404, longitude: 106.6659 },
      { name: "Ward 10", latitude: 10.8476, longitude: 106.6574 },
    ],
  },
];

// import { isEqual } from "lodash";

export class MockFirebaseMethodError extends Error {}

export class MockResult {
  exists: boolean;

  _data: any;

  constructor(exists: boolean, _data: any) {
    this.exists = exists;
    this._data = _data;
  }

  data() {
    return this._data;
  }
}

const testOrder = {
  created_at: 123,
  stripe_id: "st_123",
  email: "bluemangroupie@gmail.com",
  status: "new",
  name: "Aditya TestUser",
  test: false,
  pet_type: "dog",
};

export class MockDocRef {
  options: Options;

  calls: { set: any[]; get: any[]; update: any[] };

  collectionName: string;

  constructor(collectionName: string, options: Options) {
    this.collectionName = collectionName;
    this.options = options;
    this.calls = {
      set: [],
      get: [],
      update: [],
    };
  }

  clearAllMocks() {
    this.calls = {
      set: [],
      get: [],
      update: [],
    };
  }

  // eslint-disable-next-line consistent-return
  async set(data: any) {
    if (this.options.allowedMethods.includes("set")) {
      this.calls.set.push(data);
      return data;
    }
    if (this.options.allowedMethods.includes("logEmailSent")) {
      const validCollections = [
        "email_order_complete_email_sent",
        "email_upload_email_sent",
      ];
      if (
        validCollections.includes(this.collectionName) // &&
        // isEqual(Object.keys(data), ["created_at"])
      ) {
        this.calls.set.push(data);
      } else {
        throw new MockFirebaseMethodError(
          `logEmailSent method is allowed, but you are doing more than logging. Data: ${JSON.stringify(
            data,
          )} collection: ${this.collectionName}`,
        );
      }
    } else {
      throw new MockFirebaseMethodError(
        `Cannot set in MockDocRef. Data: ${JSON.stringify(data)}`,
      );
    }
  }

  async update(data: any) {
    if (this.options.allowedMethods.includes("update")) {
      this.calls.update.push(data);
      return data;
    }
    if (this.options.allowedMethods.includes("updateOrderStatus")) {
      if (true) {
        // isEqual(Object.keys(data), ["status"])) {
        this.calls.update.push(data);
      } else {
        throw new MockFirebaseMethodError(
          `update order status method is allowed, but you are updating more than the order status. Data: ${JSON.stringify(
            data,
          )}`,
        );
      }
      return data;
    }
    throw new MockFirebaseMethodError(
      `Cannot update in MockDocRef. Data: ${JSON.stringify(data)}`,
    );
  }

  async get(params: any = null) {
    if (this.options.allowedMethods.includes("get")) {
      if (this.collectionName === "orders") {
        this.calls.get.push(params);
        return new MockResult(true, testOrder);
      }
      throw new Error(
        `not sure what to get for collection: ${this.collectionName}`,
      );
    } else {
      throw new MockFirebaseMethodError(
        `Cannot get in MockDocRef. Params: ${JSON.stringify(params)}`,
      );
    }
  }
}

export class MockCollection {
  name: string;

  options: Options;

  _doc: MockDocRef;

  constructor(name: string, options: Options) {
    this.name = name;
    this.options = options;
    this._doc = new MockDocRef(this.name, this.options);
  }

  doc(name = "bar") {
    return this._doc;
  }

  clearAllMocks() {
    this._doc.clearAllMocks();
  }
}

type Method = "get" | "set" | "update" | "updateOrderStatus" | "logEmailSent";
type Options = {
  allowedMethods: Method[];
};

export class MockFirestore {
  options: Options;

  _collections: any;

  constructor(options: Options) {
    this.options = options;
    this._collections = {};
  }

  collection(name = "foo") {
    console.log("collection name:!! ", name);
    if (!this._collections[name]) {
      this._collections[name] = new MockCollection(name, this.options);
    }
    return this._collections[name];
  }

  _getDocRef(collectionName: string) {
    return this.collection(collectionName).doc();
  }

  clearAllMocks() {
    Object.values(this._collections).forEach((collection) => {
      (collection as MockCollection).clearAllMocks();
    });
  }
}

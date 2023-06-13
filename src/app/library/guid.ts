import uuid = require('uuid/v4');

export default class Guid {
  static NewGuid(): string {
    return uuid();
  }
  static Empty(): string {
    return '00000000-0000-0000-0000-000000000000';
  }
}

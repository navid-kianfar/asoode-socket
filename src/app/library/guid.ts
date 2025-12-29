import { v4 as uuid } from 'uuid';

export default class Guid {
  static NewGuid(): string {
    return uuid();
  }
  static Empty(): string {
    return '00000000-0000-0000-0000-000000000000';
  }
}

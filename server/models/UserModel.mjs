import {v4 as uuidv4} from 'uuid';

export default class User {
  constructor(name, email, password, role) {
    this.id = uuidv4().replaceAll('-', '');
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = Date.now();
  }
}
import { User } from '@connect-x/shared';
import { IUserRepository } from '../../domain/ports/IUserRepository';

export class InMemoryUserRepository implements IUserRepository {
 private users: Map<string, User> = new Map();

 async save(user: User): Promise<void> {
  this.users.set(user.username, user);
 }

 async findByUsername(username: string): Promise<User | undefined> {
  return this.users.get(username);
 }
}

import { User } from '@connect-x/shared';
import { IUserRepository } from '../../domain/ports/IUserRepository';

import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

@injectable()
export class UserService {
 constructor(@inject(TYPES.UserRepository) private userRepository: IUserRepository) { }

 async register(username: string): Promise<User> {
  const trimmedUsername = username.trim().toLowerCase();
  const existingUser = await this.userRepository.findByUsername(trimmedUsername);

  if (existingUser) {
   // For MVP, if user exists we just return it (like a login)
   return existingUser;
  }

  const user: User = {
   username: trimmedUsername,
   createdAt: new Date(),
  };

  await this.userRepository.save(user);
  return user;
 }

 async getUser(username: string): Promise<User | undefined> {
  return this.userRepository.findByUsername(username.trim().toLowerCase());
 }
}

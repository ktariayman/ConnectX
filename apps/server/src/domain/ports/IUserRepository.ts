import { User } from '@connect-x/shared';

export interface IUserRepository {
 save(user: User): Promise<void>;
 findByUsername(username: string): Promise<User | undefined>;
}

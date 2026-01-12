import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {DataObject, Filter, repository} from '@loopback/repository';
import {User} from '../models';
import {UserRepository} from '../repositories';

@bind({scope: BindingScope.TRANSIENT})
export class UserService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) { }

  async createUser(user: DataObject<User>): Promise<User> {
    return this.userRepository.create(user);
  }

  async getUsers(
    filter?: Filter<User>,
    pageState?: string,
  ): Promise<{users: User[]; nextPageState?: string}> {
    return this.userRepository.findAll(filter, pageState);
  }

  async getUserById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  async updateUserById(id: string, user: Partial<User>): Promise<void> {
    return this.userRepository.updateById(id, user);
  }

  async deleteUserById(id: string): Promise<void> {
    return this.userRepository.deleteById(id);
  }

  async countUsers(): Promise<number> {
    return this.userRepository.countAll();
  }
}

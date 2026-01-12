import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {User} from '../models';
import {UserService} from '../services';

export class UserController {
  constructor(
    @service(UserService)
    public userService: UserService,
  ) { }

  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    return this.userService.createUser(user);
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances with pagination',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: getModelSchemaRef(User, {includeRelations: true}),
            },
            nextPageState: {
              type: 'string',
              description: 'Page state for next page (base64 encoded)',
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(User) filter?: Filter<User>,
    @param.query.string('pageState') pageState?: string,
  ): Promise<{users: User[]; nextPageState?: string}> {
    return this.userService.getUsers(filter, pageState);
  }

  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(): Promise<Count> {
    const count = await this.userService.countUsers();
    return {count};
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
  ): Promise<User> {
    return this.userService.getUserById(id);
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: Partial<User>,
  ): Promise<void> {
    await this.userService.updateUserById(id, user);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userService.deleteUserById(id);
  }
}

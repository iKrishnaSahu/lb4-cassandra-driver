import {Client, expect} from '@loopback/testlab';
import {LoopbackCassandraApplication} from '../..';
import {setupApplication} from './test-helper';

describe('UserController', () => {
  let app: LoopbackCassandraApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  const testUser = {
    name: 'Acceptance Test User',
    email: 'acceptance@test.com',
    age: 99,
  };

  let createdUserId: string;

  it('invokes POST /users', async () => {
    const res = await client.post('/users').send(testUser).expect(200);
    expect(res.body).to.containEql(testUser);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('createdAt');
    createdUserId = res.body.id;
  });

  it('invokes GET /users/{id}', async () => {
    const res = await client.get(`/users/${createdUserId}`).expect(200);
    expect(res.body).to.containEql(testUser);
  });

  it('invokes GET /users (List)', async () => {
    const res = await client.get('/users').expect(200);
    expect(res.body).to.have.property('users');
    expect(res.body.users).to.be.an.Array();
    const found = res.body.users.find((u: any) => u.id === createdUserId);
    expect(found).to.not.be.undefined();
  });

  it('invokes GET /users/count', async () => {
    const res = await client.get('/users/count').expect(200);
    expect(res.body).to.have.property('count');
    expect(res.body.count).to.be.a.Number();
    expect(res.body.count).to.be.greaterThanOrEqual(1);
  });

  it('invokes PATCH /users/{id}', async () => {
    const updateData = {age: 100};
    await client.patch(`/users/${createdUserId}`).send(updateData).expect(204);

    // Verify update
    const res = await client.get(`/users/${createdUserId}`).expect(200);
    expect(res.body.age).to.equal(100);
  });

  it('invokes GET /users with Filter', async () => {
    // Filter by name
    const filter = {where: {name: testUser.name}};
    const res = await client.get('/users').query({filter: JSON.stringify(filter)}).expect(200);

    expect(res.body.users).to.be.an.Array();
    expect(res.body.users.length).to.be.greaterThanOrEqual(1);
    expect(res.body.users[0].name).to.equal(testUser.name);
  });

  it('invokes DELETE /users/{id}', async () => {
    await client.del(`/users/${createdUserId}`).expect(204);
    await client.get(`/users/${createdUserId}`).expect(404);
  });
});

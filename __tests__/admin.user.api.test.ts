import getUsersHandler from '@lib/api/admin/users/getUsers';
import createUserHandler from '@lib/api/admin/users/createUser';
import updateUserRoleHandler from '@lib/api/admin/users/updateUserRole';
import updateUserDisabledHandler from '@lib/api/admin/users/updateUserDisabled';
import deleteUserHandler from '@lib/api/admin/users/deleteUser';

jest.mock('@lib/users', () => ({
  getAllUsers: jest.fn(),
  addUser: jest.fn(),
  updateUserRole: jest.fn(),
  setUserDisabled: jest.fn(),
  deleteUser: jest.fn(),
  findUser: jest.fn(),
}));

const {
  getAllUsers,
  addUser,
  updateUserRole,
  setUserDisabled,
  deleteUser,
  findUser,
} = jest.requireMock('@lib/users');

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as any;
}

describe('admin users api handlers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getUsersHandler returns paginated users', async () => {
    (getAllUsers as jest.Mock).mockResolvedValue([
      { id: 1, email: 'a@test.com' },
      { id: 2, email: 'b@test.com' },
    ]);
    const req = {
      method: 'GET',
      query: { page: '1', limit: '1', search: 'a', sort: 'newest' },
    } as any;
    const res = mockRes();
    await getUsersHandler(req, res);
    expect(getAllUsers).toHaveBeenCalledWith('a', 'newest');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      users: [{ id: 1, email: 'a@test.com' }],
      total: 2,
      page: 1,
      limit: 1,
    });
  });

  test('createUserHandler validates required fields', async () => {
    const req = { method: 'POST', body: { email: '', password: '' } } as any;
    const res = mockRes();
    await createUserHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('createUserHandler creates user', async () => {
    const body = {
      email: 'a@test.com',
      password: 'pw',
      firstName: 'A',
      lastName: 'B',
      brandName: 'B',
      gender: 'OTHER',
      role: 'USER',
    };
    const req = { method: 'POST', body } as any;
    const res = mockRes();
    await createUserHandler(req, res);
    expect(addUser).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('updateUserRoleHandler validates body', async () => {
    const req = { method: 'PUT', body: {} } as any;
    const res = mockRes();
    await updateUserRoleHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateUserRoleHandler forbids super admin', async () => {
    (findUser as jest.Mock).mockResolvedValue({ role: 'SUPER_ADMIN' });
    const req = { method: 'PUT', body: { email: 'x', role: 'BRAND' } } as any;
    const res = mockRes();
    await updateUserRoleHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('updateUserRoleHandler updates role', async () => {
    (findUser as jest.Mock).mockResolvedValue({ role: 'USER' });
    const req = { method: 'PUT', body: { email: 'x', role: 'BRAND' } } as any;
    const res = mockRes();
    await updateUserRoleHandler(req, res);
    expect(updateUserRole).toHaveBeenCalledWith('x', 'BRAND');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('updateUserDisabledHandler validates body', async () => {
    const req = { method: 'PATCH', body: { email: 'x' } } as any;
    const res = mockRes();
    await updateUserDisabledHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateUserDisabledHandler forbids super admin', async () => {
    (findUser as jest.Mock).mockResolvedValue({ role: 'SUPER_ADMIN' });
    const req = { method: 'PATCH', body: { email: 'x', disabled: true } } as any;
    const res = mockRes();
    await updateUserDisabledHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('updateUserDisabledHandler updates status', async () => {
    (findUser as jest.Mock).mockResolvedValue({ role: 'USER' });
    const req = { method: 'PATCH', body: { email: 'x', disabled: false } } as any;
    const res = mockRes();
    await updateUserDisabledHandler(req, res);
    expect(setUserDisabled).toHaveBeenCalledWith('x', false);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deleteUserHandler requires email', async () => {
    const req = { method: 'DELETE', query: {} } as any;
    const res = mockRes();
    await deleteUserHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('deleteUserHandler forbids super admin', async () => {
    (findUser as jest.Mock).mockResolvedValue({ role: 'SUPER_ADMIN' });
    const req = { method: 'DELETE', query: { email: 'x' } } as any;
    const res = mockRes();
    await deleteUserHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('deleteUserHandler deletes user', async () => {
    (findUser as jest.Mock).mockResolvedValue({ role: 'USER' });
    const req = { method: 'DELETE', query: { email: 'x' } } as any;
    const res = mockRes();
    await deleteUserHandler(req, res);
    expect(deleteUser).toHaveBeenCalledWith('x');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});


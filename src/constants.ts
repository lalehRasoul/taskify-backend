export const messages = {
  userExist: 'User already signed up.',
  userNotFound: 'User not found.',
  projectExist: 'The project already exist.',
  projectIdRequred: 'Project id required.',
  projectNotFound: 'Project not found.',
};

export const config = {
  SECRET: '123123123taskify123123123',
  JWT_EXPIRE_TIME: '3600s',
  DATABASE: {
    NAME: 'taskify',
    PASSWORD: 'taskify',
    USERNAME: 'root',
    HOST: 'localhost',
    PORT: 3306,
  },
};

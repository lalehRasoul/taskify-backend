export const messages = {
  userExist: 'User already signed up.',
  userNotFound: 'User not found.',
  projectExist: 'The project already exist.',
  projectIdRequred: 'Project id required.',
  projectNotFound: 'Project not found.',
  doesNotHavePermission: 'User does not have permission.',
  taskNotFound: 'Task not found.',
  leftPermission: "You can't left this project.",
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
  NODE_MAILER: {
    HOST: 'mail.articlesland.ir',
    PORT: 465,
    SECURE: true,
    USERNAME: 'admin@articlesland.ir',
    PASSWORD: '1379ali9731',
    FROM: '"Articlesland Contact" <admin@articlesland.ir>',
    SUBJECT: 'Recovery Password Email',
    WEBSITE: 'http://localhost:3000',
  },
};

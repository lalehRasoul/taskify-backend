import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { Project } from './project/project.entity';
import { TaskModule } from './task/task.module';
import { Task } from './task/task.entity';
import { AuthModule } from './auth/auth.module';
import { config } from './constants';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: config.DATABASE.HOST,
      port: config.DATABASE.PORT,
      username: config.DATABASE.USERNAME,
      password: config.DATABASE.PASSWORD,
      database: config.DATABASE.NAME,
      entities: [User, Project, Task],
      synchronize: true,
    }),
    UserModule,
    ProjectModule,
    TaskModule,
    AuthModule,
    UtilsModule,
  ],
})
export class AppModule {}

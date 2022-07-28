import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { Project } from './project/project.entity';
import { TaskModule } from './task/task.module';
import { Task } from './task/task.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'taskify',
      database: 'taskify',
      entities: [User, Project, Task],
      synchronize: true,
    }),
    UserModule,
    ProjectModule,
    TaskModule,
  ],
})
export class AppModule {}

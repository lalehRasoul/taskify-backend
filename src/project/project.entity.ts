import { Task } from 'src/task/task.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Relation,
  OneToMany,
} from 'typeorm';

@Entity('project')
export class Project {
  constructor(partial: Partial<Project>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id, {
    cascade: true,
  })
  @JoinColumn({ name: 'ownerId' })
  owner: Relation<User>;

  @ManyToMany(() => User, (user) => user.projects)
  @JoinColumn()
  users: Relation<User[]>;

  @OneToMany(() => Task, (task) => task.project, {
    cascade: true,
  })
  tasks: Relation<Task[]>;
}

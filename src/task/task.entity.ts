import { Project } from 'src/project/project.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('task')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  note: string;

  @Column({ default: false })
  checked: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id, {
    cascade: true,
  })
  owner: User;

  @ManyToOne(() => User, (user) => user.id, {
    cascade: true,
  })
  asign: User;

  @ManyToOne(() => Project, (project) => project.id, {
    cascade: true,
  })
  project: Project;
}

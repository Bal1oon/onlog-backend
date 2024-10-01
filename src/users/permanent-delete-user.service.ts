import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Cron } from '@nestjs/schedule';
import * as config from 'config';
import { PostRepository } from 'src/posts/post.repository';
import { CommentRepository } from '../comments/comment.repository';

@Injectable()
export class PermanentDeleteUserService {
    private logger = new Logger(PermanentDeleteUserService.name);
    
    constructor(
        private readonly userRepository: UserRepository,
        private readonly postRepository: PostRepository,
        private readonly commentRepository: CommentRepository
    ) {}

    @Cron('0 0 * * *')  // 매일 자정 실행
    async handleExpiredUsers() {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() - config.get('deletion').expiresIn);    // 개발 환경 시 삭제 기준 1일

        try {
            const expiredUsers = await this.userRepository
                .createQueryBuilder('user')
                .withDeleted()
                .where('user.deletedAt IS NOT NULL')
                .andWhere('user.deletedAt < :expirationDate', { expirationDate })
                .getMany();

            if (expiredUsers.length > 0) {
                const deletedUserIds = expiredUsers.map(user => user.id);

                for (const user of expiredUsers) {
                    await this.postRepository.update({ user }, { user: null });
                    await this.commentRepository.update({ user }, { user: null });
                }

                await this.userRepository.remove(expiredUsers);
                this.logger.log(`Deleted ${expiredUsers.length} users permanently: ${deletedUserIds.join(', ')}`);
            } else {
                this.logger.log('No expired users to delete.');
            }
        } catch (error) {
            this.logger.error('Error occurred while deleting expired users', error.stack);
        }
    }
}
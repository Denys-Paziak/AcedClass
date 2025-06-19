import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class GetMyMessagesResponse {
	@Expose({ name: 'id' })
    @ApiProperty({ description: 'Унікальний ідентифікатор повідомлення', example: 1, type: Number })
	id: number

    @Expose({ name: 'subject' })
    @ApiProperty({
        description: 'Тема повідомлення',
        example: 'Запит щодо документа',
        type: String
    })
    subject: string

    @Expose({ name: 'message' })
    @ApiProperty({
        description: 'Текст повідомлення',
        example: 'Доброго дня, я маю запит щодо цього документа.',
        type: String
    })
    message: string

	@Expose({ name: 'createdAt' })
    @ApiProperty({
        description: 'Дата та час створення повідомлення',
        example: '2023-10-01T12:00:00Z',
        type: String
    })
    createdAt: Date
	
    @Expose({ name: 'updatedAt' })
    @ApiProperty({
        description: 'Дата та час останнього оновлення повідомлення',
        example: '2023-10-01T12:00:00Z',
        type: String
    })
	updatedAt: Date
}

import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class TopUniversitiesResponse {
    @Expose({ name: 'id' })
    @ApiProperty({
        description: 'Унікальний ідентифікатор університету',
        example: 1,
        type: Number
    })
    id: number

    @Expose({ name: 'name' })
    @ApiProperty({
        description: 'Назва університету',
        example: 'National University',
        type: String
    })
    name: string
    
    @Expose({ name: 'documentCount' })
    @ApiProperty({
        description: 'Кількість документів, пов’язаних з університетом',
        example: 150,
        type: Number
    })
    documentCount: number
}

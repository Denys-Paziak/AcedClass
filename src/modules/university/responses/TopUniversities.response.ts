import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class TopUniversitiesResponse {
    @Expose({ name: 'id' })
    @ApiProperty({
        description: 'Unique university identifier',
        example: 1,
        type: Number
    })
    id: number

    @Expose({ name: 'name' })
    @ApiProperty({
        description: 'University name',
        example: 'National University',
        type: String
    })
    name: string
    
    @Expose({ name: 'documentCount' })
    @ApiProperty({
        description: 'Number of documents associated with the university',
        example: 150,
        type: Number
    })
    documentCount: number
}

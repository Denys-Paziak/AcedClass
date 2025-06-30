import { Body, Head, Heading, Preview, Section, Tailwind, Text } from "@react-email/components";
import { Html } from "@react-email/html";
import * as React from "react";

export function AdminSendEmailToUsersTemplate({  subject, message }: {  subject: string, message: string }) {
    return (
        <Html>
            <Head/>
            <Preview>{subject}</Preview>
            <Tailwind>
                <Body>
                    <Section>
                        <Heading>{subject}</Heading>
                        <Text>{ message }</Text>
                    </Section>
                </Body>
            </Tailwind>
        </Html>
    )
}
import { Body, Head, Heading, Preview, Section, Tailwind, Text } from "@react-email/components";
import { Html } from "@react-email/html";
import * as React from "react";

export function MessageContactSupportTemplate({ subject, message, userEmail }: { subject: string, message: string, userEmail: string }) {
    return (
        <Html>
            <Head/>
            <Preview>Лист службі підтримки</Preview>
            <Tailwind>
                <Body>
                    <Section>
                        <Heading>{subject}</Heading>
                        <Text>{ message }</Text>
                        <Text>{ userEmail }</Text>
                    </Section>
                </Body>
            </Tailwind>
        </Html>
    )
}
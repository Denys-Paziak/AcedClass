import { Body, Head, Heading, Preview, Section, Tailwind, Text } from "@react-email/components";
import { Html } from "@react-email/html";
import * as React from "react";

export function AdminVerificationCodeTemplate({ code }: { code: string }) {
    return (
        <Html>
            <Head/>
            <Preview>Код підтвердження</Preview>
            <Tailwind>
                <Body>
                    <Section>
                        <Heading>Код підтвердження</Heading>
                        <Text>{ code }</Text>
                    </Section>
                </Body>
            </Tailwind>
        </Html>
    )
}
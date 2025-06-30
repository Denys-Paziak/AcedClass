import { Body, Head, Heading, Preview, Section, Tailwind, Text } from "@react-email/components";
import { Html } from "@react-email/html";
import * as React from "react";

export function AdminAlertTemplate({ documentPending }: { documentPending: number }) {
    return (
        <Html>
            <Head/>
            <Preview>Документи що очікують перевірки: {String(documentPending)}</Preview>
            <Tailwind>
                <Body>
                    <Section>
                        <Heading>Документи що очікують перевірки</Heading>
                        <Text>{ String(documentPending) }</Text>
                    </Section>
                </Body>
            </Tailwind>
        </Html>
    )
}
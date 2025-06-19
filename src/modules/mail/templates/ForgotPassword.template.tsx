import { Body, Head, Heading, Link, Preview, Section, Tailwind } from "@react-email/components";
import { Html } from "@react-email/html";
import * as React from "react";

export function ForgotPasswordTemplate({ link }: { link: string }) {
    return (
        <Html>
            <Head/>
            <Preview>Скидування паролю</Preview>
            <Tailwind>
                <Body>
                    <Section>
                        <Heading>Скидування паролю</Heading>
                        <Link href={link}>Скинути пароль</Link>
                    </Section>
                </Body>
            </Tailwind>
        </Html>
    )
}
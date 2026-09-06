interface EmailTemplateProps {
    title: string;
    greeting?: string;
    instructions: string;
    buttonText: string;
    buttonUrl: string;
    additionalInfo?: string;
}

// Базовый шаблон письма
const generateEmailHTML = ({
    title,
    greeting = 'Здравствуйте!',
    instructions,
    buttonText,
    buttonUrl,
    additionalInfo = '',
}: EmailTemplateProps): string => {
    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${title}</h2>
      <p>${greeting}</p>
      <p>${instructions}</p>
      <p>
        <a href="${buttonUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
          ${buttonText}
        </a>
      </p>
      <p>Или скопируйте эту ссылку в браузер:<br/> ${buttonUrl}</p>
      ${additionalInfo ? `<p>${additionalInfo}</p>` : ''}
    </div>
  `;
};

// Письмо для подтверждения email (verify)
export const generateVerificationEmailHTML = (token: string, baseUrl: string): string => {
    const url = `${baseUrl}/verify?token=${token}`;
    return generateEmailHTML({
        title: 'Добро пожаловать в Минто!',
        instructions: 'Пожалуйста, подтвердите вашу электронную почту, перейдя по ссылке ниже:',
        buttonText: 'Подтвердить почту',
        buttonUrl: url,
    });
};

// Письмо для сброса пароля (forgotPassword).
export const generateForgotPasswordEmailHTML = (token: string | undefined, baseUrl: string): string => {
    const url = `${baseUrl}/reset-password?token=${token}`;
    return generateEmailHTML({
        title: 'Смена пароля',
        instructions: 'Вы запросили изменение пароля. Перейдите по ссылке ниже, чтобы задать новый пароль:',
        buttonText: 'Изменить пароль',
        buttonUrl: url,
        additionalInfo: 'Если вы не запрашивали изменение пароля, просто проигнорируйте это письмо.',
    });
};

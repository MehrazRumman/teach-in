import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import { Container } from '@react-email/container';

interface ReminderEmailParams {
  name: string;
  course_name: string;
  id: string;
  fb: string;
  link: string;
}

export default function ReminderEmail({
  name,
  course_name,
  id,
  fb,
  link,
}: ReminderEmailParams) {
  return (
    <Html>
      <Section>
        <Container style={container}>
          <Text style={heading}>Welcome to Teach-In!</Text>

          <Text style={paragraph}>
            Hi {name},<br />
            <br />
            We are thrilled to inform you that your course enrollment for{' '}
            {course_name} has been successfully completed! 🎉
            <br />
            <br />
            <div style={highlightBox}>
              <strong>Your Course ID:</strong>
              <br />
              <span style={highlightText}>{id}</span>
            </div>
            <br />
            <br />
            <a
              href={fb}
              style={purpleLink} // Use the purple link style
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Course Facebook Group
            </a>
            <br />
            <br />
            <br />
            <a
              href={link}
              style={purpleLink} // Use the purple link style
              target="_blank"
              rel="noopener noreferrer"
            >
              Go to Course
            </a>
            <br />
            <br />
            <br />
            We&apos;re excited to have you on board and can&apos;t wait to see
            you succeed in your course journey!
            <br />
            <br />
            Thank you for choosing Teach-In for your learning adventure. If you
            have any questions or need assistance, feel free to reach out.
            <br />
            <br />
            Best regards,
            <br />
            Teach In Team
          </Text>
        </Container>
      </Section>
    </Html>
  );
}

// Styles for the email template
const purpleLink = {
  backgroundColor: '#fce36c',
  color: 'purple', // Use purple color
  textDecoration: 'none',
  fontWeight: 'bold',
  padding: '10px',
  borderRadius: '10px', // Add rounded corners
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: 'purple',
};

const paragraph = {
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#484848',
};

const highlightBox = {
  backgroundColor: '#710193',
  color: '#ffffff',
  padding: '10px',
  borderRadius: '5px',
};

const highlightText = {
  fontSize: '20px',
  fontWeight: 'bold',
};

import { AuthForm } from '../components/AuthForm';
import { AuthShell } from '../components/AuthShell';
import { authProvider } from '../services/providerFactory';
export default function Auth() {
  return <AuthShell appName="Next" logo="/next.svg"><AuthForm onAuthenticate={(email, password, signUpMode) => signUpMode ? authProvider.signUp(email, password) : authProvider.signIn(email, password)} /></AuthShell>;
}

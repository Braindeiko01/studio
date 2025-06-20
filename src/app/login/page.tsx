import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const handleGoogleLogin = async () => {
  setIsLoading(true);
  try {
    const provider = new GoogleAuthProvider();
    const authInstance = getAuth();
    const result = await signInWithPopup(authInstance, provider);
    const user = result.user;

    const googleData: GoogleAuthValues = {
      googleId: user.uid,
      email: user.email || '',
      username: user.displayName || '',
      avatarUrl: user.photoURL || '',
    };

    const response = await loginWithGoogleAction(
      googleData.googleId,
      googleData.email,
      googleData.username,
      googleData.avatarUrl
    );

    if (response.user) {
      if (response.needsProfileCompletion) {
        sessionStorage.setItem('pendingGoogleAuthData', JSON.stringify(response.user));
        router.push('/register?step=2');
      } else {
        auth.login(response.user);
        toast({ title: "¡Bienvenido!", description: `Hola ${response.user.username}`, variant: "default" });
        router.push('/');
      }
    } else {
      toast({ title: "Error", description: response.error, variant: "destructive" });
    }
  } catch (error: any) {
    toast({ title: "Error de autenticación", description: error.message, variant: "destructive" });
  }
  setIsLoading(false);
};

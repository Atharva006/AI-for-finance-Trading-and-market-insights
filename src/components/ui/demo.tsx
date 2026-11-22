import NexusLogin from "./nexus-3d-animated-login-futuristic-authentication-ui";

export default function DemoOne() {
  return (
    <NexusLogin
      brandName="ALLTRA"
      title="Institutional Access"
      description="Sign in to continue to your quantitative workspace."
      accentColor="#10B981"
      showSocialLogin
      showRememberMe
      showForgotPassword
      show3DScene
      enableAnimations
      enableMouseParallax
    />
  );
}

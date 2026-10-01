import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { styles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";

// Two steps: email a reset code, then submit the code with a new password.
export default function ForgotPasswordScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSendCodePress = async () => {
    if (!isLoaded) return;
    if (!emailAddress.trim()) return setError("Please enter your email address.");

    setIsLoading(true);
    setError("");
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress.trim(),
      });
      setCodeSent(true);
    } catch (err) {
      if (err.errors?.[0]?.code === "form_identifier_not_found") {
        setError("No account found with that email address.");
      } else {
        setError(err.errors?.[0]?.longMessage || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPress = async () => {
    if (!isLoaded) return;
    if (!code.trim() || !password) return setError("Please enter the code and a new password.");

    setIsLoading(true);
    setError("");
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(result, null, 2));
        setError("Couldn't finish resetting your password. Please try again.");
      }
    } catch (err) {
      const first = err.errors?.[0];
      if (first?.code === "form_code_incorrect") {
        setError("That code is incorrect. Please check your email and try again.");
      } else {
        setError(first?.longMessage || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {codeSent
            ? `We sent a code to ${emailAddress.trim()}. Enter it below with your new password.`
            : "Enter your account email and we'll send you a code to reset your password."}
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        {codeSent ? (
          <>
            <TextInput
              style={[styles.input, error && styles.errorInput]}
              value={code}
              placeholder="Enter reset code"
              placeholderTextColor="#9A8478"
              keyboardType="number-pad"
              onChangeText={setCode}
            />
            <TextInput
              style={[styles.input, error && styles.errorInput]}
              value={password}
              placeholder="Enter new password"
              placeholderTextColor="#9A8478"
              secureTextEntry={true}
              onChangeText={setPassword}
            />
          </>
        ) : (
          <TextInput
            style={[styles.input, error && styles.errorInput]}
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#9A8478"
            onChangeText={setEmailAddress}
          />
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={codeSent ? onResetPress : onSendCodePress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>{codeSent ? "Reset Password" : "Send Code"}</Text>
          )}
        </TouchableOpacity>

        {codeSent ? (
          <TouchableOpacity onPress={onSendCodePress} disabled={isLoading} style={styles.resendButton}>
            <Text style={styles.linkText}>Resend code</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Remembered it?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

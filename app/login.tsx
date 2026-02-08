import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { signInWithPassword, signUpWithPassword, operationLoading } = useAuth();
  const { showAlert } = useAlert();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please fill all required fields');
      return;
    }

    if (isSignUp) {
      if (password.length < 6) {
        showAlert('Error', 'Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        showAlert('Error', 'Passwords do not match');
        return;
      }
      if (!username.trim()) {
        showAlert('Error', 'Please enter a username');
        return;
      }

      const { error, user } = await signUpWithPassword(email, password, { username: username.trim() });
      if (error) {
        console.log('Sign up error:', error);
        showAlert('Sign Up Failed', error);
      } else if (user) {
        showAlert('Success', 'Account created successfully!');
      }
    } else {
      const { error, user } = await signInWithPassword(email, password);
      if (error) {
        console.log('Login error:', error);
        // Show more helpful error message
        const errorLower = error.toLowerCase();
        if (errorLower.includes('invalid') || errorLower.includes('credentials') || errorLower.includes('password')) {
          showAlert(
            'Login Failed',
            'Wrong email or password.\n\n' +
            '• Check your email and password\n' +
            '• Make sure you created an account first\n' +
            '• Click Sign Up if this is your first time'
          );
        } else if (errorLower.includes('email not confirmed')) {
          showAlert('Email Not Verified', 'Please check your email and verify your account before logging in.');
        } else {
          showAlert('Login Failed', error);
        }
      } else if (user) {
        showAlert('Success', 'Welcome back!');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={theme.gradient} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <MaterialIcons name="school" size={64} color="#FFFFFF" />
            <Text style={styles.title}>Material Hub X</Text>
            <Text style={styles.subtitle}>Your Gateway to Success</Text>
          </View>

          <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
            <View style={[styles.infoBox, { backgroundColor: isSignUp ? '#4CAF5015' : '#6C63FF15', borderColor: isSignUp ? '#4CAF50' : '#6C63FF' }]}>
              <MaterialIcons name="info" size={18} color={isSignUp ? '#4CAF50' : '#6C63FF'} />
              <Text style={[styles.infoText, { color: isSignUp ? '#4CAF50' : '#6C63FF' }]}>
                {isSignUp ? (
                  <>
                    <Text style={{ fontWeight: '700' }}>Admin Setup:{' '}</Text>
                    Use email: admin@materialhubx.com{' \n'}
                    <Text style={{ fontWeight: '700' }}>Note:</Text> Choose a strong password you will remember!
                  </>
                ) : (
                  <>
                    <Text style={{ fontWeight: '700' }}>No account yet?</Text> Click Sign Up below.{' \n'}
                    <Text style={{ fontWeight: '700' }}>Admin email:</Text> admin@materialhubx.com
                  </>
                )}
              </Text>
            </View>

            <Text style={[styles.formTitle, { color: theme.text }]}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>

            {isSignUp && (
              <View style={styles.inputGroup}>
                <MaterialIcons name="person" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="Username"
                  placeholderTextColor={theme.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <MaterialIcons name="email" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <MaterialIcons name="lock" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIcon, { color: theme.text, borderColor: theme.border }]}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <View style={styles.inputGroup}>
                <MaterialIcons name="lock" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIcon, { color: theme.text, borderColor: theme.border }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, operationLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={operationLoading}
            >
              <LinearGradient colors={theme.gradient} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {operationLoading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                {isSignUp ? 'Already have an account? ' : 'Do not have an account? '}
                <Text style={{ color: theme.primary, fontWeight: '600' }}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  formContainer: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formTitle: {
    ...Typography.h2,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputIcon: {
    position: 'absolute',
    left: Spacing.md,
    top: 18,
    zIndex: 1,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl + Spacing.md,
  },
  inputWithIcon: {
    paddingRight: Spacing.xl + Spacing.lg,
  },
  eyeIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: 18,
    zIndex: 1,
    padding: 4,
  },
  button: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
  },
  switchButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  switchText: {
    ...Typography.caption,
  },
});

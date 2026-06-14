import '@testing-library/jest-dom';

const PROFILE_STORAGE_KEY = 'lumina-profile';

beforeEach(() => {
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({
      userName: 'Test',
      userAge: '17',
      selectedExam: 'NEET',
      onboardingComplete: true,
    })
  );
});

afterEach(() => {
  localStorage.clear();
});

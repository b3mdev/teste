import unittest
import os

def run_all_tests():
    """Discovers and runs all tests in the 'tests' directory."""
    # Define the directory containing the tests
    test_dir = 'tests'

    # Use the default test loader to discover tests
    loader = unittest.TestLoader()

    # Discover tests in the specified directory
    # The pattern 'test*.py' will find files like test_user_model.py, test_auth_routes.py, etc.
    suite = loader.discover(start_dir=test_dir, pattern='test*.py')

    # Use a text test runner to run the tests
    runner = unittest.TextTestRunner(verbosity=2) # verbosity=2 provides more detailed output

    print(f"Discovering and running tests in '{os.path.abspath(test_dir)}'...")
    result = runner.run(suite)

    return result

if __name__ == '__main__':
    test_result = run_all_tests()
    # You can add conditions here based on test_result if needed, e.g., for CI
    if test_result.wasSuccessful():
        print("\nAll tests passed successfully!")
    else:
        print("\nSome tests failed.")
        # Exit with a non-zero status code if tests failed, useful for CI
        exit(1)

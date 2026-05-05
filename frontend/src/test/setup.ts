// Adds jest-dom matchers to vitest's expect, e.g. toBeInTheDocument(), toHaveValue()
import '@testing-library/jest-dom'

// jsdom doesn't implement these — provide stubs so components that use them don't throw
window.URL.createObjectURL = () => 'blob:mock-url'
window.URL.revokeObjectURL = () => {}

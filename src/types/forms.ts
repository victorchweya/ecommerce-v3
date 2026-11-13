export interface FormFeedback {
  pending: boolean
  error: string
  fieldErrors: Record<string, string[]>
}

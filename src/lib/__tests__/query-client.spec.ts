import { expect, it, vi } from 'vitest'
import { queryClient } from '../query-client'

it('does not automatically replay a failed mutation', async () => {
  const write = vi.fn().mockRejectedValue(new Error('Unknown write outcome'))
  const mutation = queryClient.getMutationCache().build(queryClient, { mutationFn: write })
  try {
    await expect(mutation.execute(undefined)).rejects.toThrow('Unknown write outcome')
    expect(write).toHaveBeenCalledTimes(1)
  } finally {
    queryClient.clear()
  }
})

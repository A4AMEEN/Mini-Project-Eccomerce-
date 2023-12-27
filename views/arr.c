#include <stdio.h>

int main() {
    int nums[] = {1, 3, 2,1};
    int n = sizeof(nums) / sizeof(nums[0]);
    int ans[2 * n];
    
    for (int i = 0; i < n; i++) {
        ans[i] = nums[i];
        ans[i + n] = nums[i];
    }
    
    // Print the ans array
    for (int i = 0; i < 2 * n; i++) {
        printf("%d ", ans[i]);
    }
    
    return 0;
}

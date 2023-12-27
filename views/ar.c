int main() {
    int nums[] = {1, 2, 1};
    int n = 3; 
    int ans[2 * n];

    for (int i = 0; i < n; i++) {
        ans[i] = nums[i];        
        ans[i + n] = nums[i];   
    }

    
    for (int i = 0; i < 2 * n; i++) {
        printf("%d ", ans[i]);
    }

    return 0;
}
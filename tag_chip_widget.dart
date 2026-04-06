Widget _buildTagChip(String tag) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2D9CFC), Color(0xFF27AD65)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryColor.withOpacity(0.15),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '#$tag',
            style: FontManager.labelSmall(
              color: AppColors.white,
              fontSize: 12,
            ),
          ),
          SizedBox(width: 4.w),
          GestureDetector(
            onTap: () {
              setState(() {
                _controller.removeTag(tag);
              });
              _notifyTagsChanged();
            },
            child: Icon(
              Icons.close_rounded,
              size: 14.sp,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }
}

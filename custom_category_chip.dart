SizedBox(
          height: 40,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final isSelected = selectedCategoryIndex == index;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Text(
                    categories[index],
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      color: isSelected
                          ? Colors.white
                          : (isDark
                                ? Colors.grey.shade400
                                : Colors.grey.shade700),
                      fontSize: 13,
                      fontWeight: isSelected
                          ? FontWeight.w600
                          : FontWeight.w500,
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: isDark
                      ? Colors.blueAccent.shade700
                      : const Color(0xFF0E1824),
                  backgroundColor: isDark
                      ? const Color(0xFF1E293B)
                      : Colors.grey.shade100,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  side: BorderSide(
                    color: isSelected
                        ? Colors.transparent
                        : (isDark
                              ? Colors.grey.shade800
                              : Colors.grey.shade200),
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        selectedCategoryIndex = index;
                      });
                    }
                  },
                ),
              );
            },
          ),
        ),

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from wordcloud import WordCloud
from matplotlib.backends.backend_pdf import PdfPages

# Since we don't have an actual CSV file, let's create a DataFrame from the sample data
file_path = "./fields_combined.csv"
df = pd.read_csv(file_path, low_memory=False)


# Set the style for better-looking visualizations
plt.style.use('fivethirtyeight')
sns.set_palette('colorblind')

def analyze_fields():
    """Generate visualizations for the fields data and save in a PDF"""
    with PdfPages("fields_analysis.pdf") as pdf:
        
        # 1. Top Fields by Works Count
        plt.figure(figsize=(12, 6))
        top_fields = df.groupby('display_name')['works_count'].sum().sort_values(ascending=False).head(10)
        sns.barplot(x=top_fields.values, y=top_fields.index)
        plt.title('Top 10 Fields by Number of Works')
        plt.xlabel('Total Works Count (millions)')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 2. Top Fields by Citation Count
        plt.figure(figsize=(12, 6))
        top_cited_fields = df.groupby('display_name')['cited_by_count'].sum().sort_values(ascending=False).head(10)
        sns.barplot(x=top_cited_fields.values, y=top_cited_fields.index)
        plt.title('Top 10 Fields by Citation Count')
        plt.xlabel('Total Citations (millions)')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 3. Citation Impact (Works vs Citations)
        plt.figure(figsize=(12, 8))
        plt.scatter(df['works_count'], df['cited_by_count'], alpha=0.5)
        plt.xscale('log')
        plt.yscale('log')
        plt.xlabel('Number of Works (log scale)')
        plt.ylabel('Number of Citations (log scale)')
        plt.title('Citation Impact: Works vs Citations Across Fields')
        z = np.polyfit(np.log10(df['works_count']+1), np.log10(df['cited_by_count']+1), 1)
        p = np.poly1d(z)
        x_range = np.logspace(0, np.log10(df['works_count'].max()), 100)
        plt.plot(x_range, 10**p(np.log10(x_range)), "r--", alpha=0.8)
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 4. Citations per Work Distribution
        plt.figure(figsize=(12, 6))
        df['citations_per_work'] = df['cited_by_count'] / df['works_count']
        sns.histplot(df['citations_per_work'].dropna(), bins=50, kde=True)
        plt.title('Distribution of Citations Per Work Across Fields')
        plt.xlabel('Citations Per Work')
        plt.ylabel('Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 5. Distribution of Works Across Top Fields
        plt.figure(figsize=(10, 6))
        top_fields_pie = df.groupby('display_name')['works_count'].sum().sort_values(ascending=False).head(10)
        plt.pie(top_fields_pie, labels=top_fields_pie.index, autopct='%1.1f%%', startangle=90, colors=sns.color_palette('colorblind'))
        plt.title('Distribution of Works Across Top 10 Fields')
        plt.tight_layout()
        pdf.savefig()
        plt.close()

        # 6. Word Cloud of Field Names
        plt.figure(figsize=(12, 6))
        text = ' '.join(df['display_name'].dropna())
        wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.title('Word Cloud of Academic Fields')
        pdf.savefig()
        plt.close()
        

    print("Visualizations saved in fields_analysis.pdf.")

# Run the analysis
if __name__ == "__main__":
    analyze_fields()
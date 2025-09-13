import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from wordcloud import WordCloud
from matplotlib.backends.backend_pdf import PdfPages

# Load the CSV data
file_path = "./openalex_publishers.csv"
df = pd.read_csv(file_path)

# Set the style for better-looking visualizations
plt.style.use('fivethirtyeight')
sns.set_palette('colorblind')

def analyze_publishers():
    """Generate visualizations for the publishers data and save in a PDF"""
    with PdfPages("publisher_analysis.pdf") as pdf:
        
        # 1. Top publishers by works count
        plt.figure(figsize=(12, 6))
        top_publishers = df.groupby('display_name')['works_count'].sum().sort_values(ascending=False).head(10)
        sns.barplot(x=top_publishers.values, y=top_publishers.index)
        plt.title('Top 10 Publishers by Number of Works')
        plt.xlabel('Total Works Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 2. Citation Impact
        plt.figure(figsize=(12, 8))
        plt.scatter(df['works_count'], df['cited_by_count'], alpha=0.5)
        plt.xscale('log')
        plt.yscale('log')
        plt.xlabel('Number of Works (log scale)')
        plt.ylabel('Number of Citations (log scale)')
        plt.title('Citation Impact: Works vs Citations')
        z = np.polyfit(np.log10(df['works_count']+1), np.log10(df['cited_by_count']+1), 1)
        p = np.poly1d(z)
        x_range = np.logspace(0, np.log10(df['works_count'].max()), 100)
        plt.plot(x_range, 10**p(np.log10(x_range)), "r--", alpha=0.8)
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 3. H-index distribution
        plt.figure(figsize=(12, 6))
        sns.histplot(df['h_index'].dropna(), bins=30)
        plt.title('Distribution of H-index Across Publishers')
        plt.xlabel('H-index')
        plt.ylabel('Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 4. Works vs. Sources Count
        plt.figure(figsize=(12, 6))
        sns.scatterplot(x=df['works_count'], y=df['sources_count'], alpha=0.5)
        plt.xscale('log')
        plt.yscale('log')
        plt.xlabel('Number of Works (log scale)')
        plt.ylabel('Number of Sources (log scale)')
        plt.title('Works vs Sources Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 5. Open Access Analysis
        plt.figure(figsize=(10, 6))
        if 'is_oa' in df.columns:
            oa_counts = df['is_oa'].value_counts()
            plt.pie(oa_counts, labels=['Open Access', 'Not Open Access'], autopct='%1.1f%%', startangle=90, colors=['#5cb85c', '#d9534f'])
            plt.title('Proportion of Open Access Publishers')
            plt.tight_layout()
            pdf.savefig()
            plt.close()
        
        # 6. Citations per Work Distribution
        plt.figure(figsize=(12, 6))
        df['citations_per_work'] = df['cited_by_count'] / df['works_count']
        sns.histplot(df['citations_per_work'].dropna(), bins=50, kde=True)
        plt.title('Distribution of Citations Per Work')
        plt.xlabel('Citations Per Work')
        plt.ylabel('Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()

       
        
    print("Visualizations saved in publisher_analysis.pdf.")

# Run the analysis
if __name__ == "__main__":
    analyze_publishers()

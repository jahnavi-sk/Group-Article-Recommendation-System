import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages

# Load the CSV data
file_path = "./domains.csv"
df = pd.read_csv(file_path, low_memory=False)

# Set the style for better-looking visualizations
plt.style.use('fivethirtyeight')
sns.set_palette('colorblind')

def analyze_domains():
    """Generate visualizations for the domains data and save in a PDF"""
    with PdfPages("domains_analysis.pdf") as pdf:
        
        # 1. Top Domains by Works Count
        plt.figure(figsize=(12, 6))
        top_domains = df.groupby('display_name')['works_count'].sum().sort_values(ascending=False).head(10)
        sns.barplot(x=top_domains.values, y=top_domains.index)
        plt.title('Top 10 Domains by Number of Works')
        plt.xlabel('Total Works Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 2. Top Domains by Citation Count
        plt.figure(figsize=(12, 6))
        top_cited_domains = df.groupby('display_name')['cited_by_count'].sum().sort_values(ascending=False).head(10)
        sns.barplot(x=top_cited_domains.values, y=top_cited_domains.index)
        plt.title('Top 10 Domains by Citation Count')
        plt.xlabel('Total Citations')
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
        plt.title('Citation Impact: Works vs Citations')
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
        plt.title('Distribution of Citations Per Work')
        plt.xlabel('Citations Per Work')
        plt.ylabel('Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 5. Distribution of Works Across Domains
        plt.figure(figsize=(10, 6))
        top_domains_pie = df.groupby('display_name')['works_count'].sum().sort_values(ascending=False).head(10)
        plt.pie(top_domains_pie, labels=top_domains_pie.index, autopct='%1.1f%%', startangle=90, colors=sns.color_palette('colorblind'))
        plt.title('Distribution of Works Across Top 10 Domains')
        plt.tight_layout()
        pdf.savefig()
        plt.close()

        #6. Heatmap of Works vs Citations
        plt.figure(figsize=(12, 8))
        heatmap_data = df.pivot_table(index='display_name', columns='works_count', values='cited_by_count', aggfunc='sum')
        sns.heatmap(heatmap_data, cmap='viridis', cbar_kws={'label': 'Citations'})
        plt.title('Heatmap of Works vs Citations')
        plt.xlabel('Works Count')
        plt.ylabel('Domain')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
    print("Visualizations saved in domains_analysis.pdf.")

# Run the analysis
if __name__ == "__main__":
    analyze_domains()

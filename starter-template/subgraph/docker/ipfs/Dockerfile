FROM ipfs/go-ipfs


USER root
RUN mkdir -p /data/ipfs-static
USER $UID
ENV IPFS_PATH /data/ipfs-static

COPY start_ipfs.sh /start_ipfs
RUN chmod a+x /start_ipfs
ENTRYPOINT ["/start_ipfs"]
